import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';

// DOM stubs for pdfjs-dist compatibility in serverless environments
const g = globalThis as any;
if (typeof g.DOMMatrix === "undefined") g.DOMMatrix = class DOMMatrix {};
if (typeof g.ImageData === "undefined") g.ImageData = class ImageData {};
if (typeof g.Path2D === "undefined") g.Path2D = class Path2D {};

/**
 * Robust PDF text extraction using pdf-parse (modern version).
 */
// Set worker to a CDN URL to avoid bundling issues with Turbopack/Vercel
try {
  PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs');
} catch (e) {
  console.warn('[extract-cv] Failed to set worker CDN:', e);
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    verbosity: 0,
  });

  try {
    const result = await parser.getText();
    return result.text || '';
  } catch (error) {
    console.error('[extract-cv] PDFParse error:', error);
    throw error;
  } finally {
    await parser.destroy().catch(() => {});
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SYSTEM_PROMPT =
  'You are a CV parser for an academic faculty profile system. ' +
  'Extract ALL information from the CV and return ONLY valid JSON. ' +
  'No markdown, no explanation, only the JSON object.';

const EXTRACTION_SCHEMA = `Extract the CV into this exact JSON shape:
{
  "name": "string",
  "designation": "string",
  "department": "string",
  "experience": "string",
  "email": "string",
  "phone": "string",
  "about": "string",
  "keywords": ["string"],
  "research_interests": ["string"],
  "education": [{ "degree": "string", "institution": "string", "year": "string" }],
  "publications": [{ "type": "string", "title": "string", "venue": "string", "index_tag": "string", "doi": "string", "award": "string", "year": "string" }],
  "projects": [{ "title": "string", "description": "string", "role": "string", "year": "string", "url": "string" }],
  "awards": [{ "title": "string", "body": "string", "year": "string" }],
  "certifications": [{ "name": "string", "org": "string", "year": "string" }],
  "memberships": ["string"],
  "invited_talks": [{ "topic": "string", "event": "string", "date": "string", "mode": "string" }],
  "custom_sections": [{ "title": "string", "content": "string" }],
  "social_links": {
    "linkedin": "string",
    "google_scholar": "string",
    "researchgate": "string",
    "twitter": "string",
    "website": "string"
  }
}`;

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse multipart form data ──────────────────────────────────────
    const form = await request.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send a PDF as the "file" field.' },
        { status: 400 },
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 10 MB size limit.' }, { status: 400 });
    }

    // ── 2. Validate API key ───────────────────────────────────────────────
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[extract-cv] GROQ_API_KEY is missing in environment variables');
      return NextResponse.json(
        { error: 'API Key Missing: Please set GROQ_API_KEY in your Vercel project settings.' },
        { status: 500 },
      );
    }

    // ── 3. Extract text from PDF using pdf-parse ──────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      console.log('[extract-cv] Starting PDF text extraction...');
      pdfText = await extractTextFromPdf(buffer);
      console.log(`[extract-cv] Extracted ${pdfText.length} characters`);
    } catch (parseErr) {
      const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.error('[extract-cv] PDF parsing error:', errMsg);
      return NextResponse.json(
        { error: `PDF Parse Error: ${errMsg}. Try a different PDF format.` },
        { status: 422 },
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or is a scanned image-only document.' },
        { status: 422 },
      );
    }

    // Trim to stay within Groq's TPM limit (~20k chars ≈ ~5k tokens for free-tier 12k TPM)
    const truncatedText = pdfText.slice(0, 20000);

    // ── 4. Call Groq API ──────────────────────────────────────────────────
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${EXTRACTION_SCHEMA}\n\nCV Content:\n${truncatedText}`,
        },
      ],
      max_tokens: 3000,
      temperature: 0,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() ?? '';

    if (!responseText) {
      return NextResponse.json(
        { error: 'Groq returned an empty response.' },
        { status: 500 },
      );
    }

    // ── 5. Extract and parse JSON from response ───────────────────────────
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace < firstBrace) {
      return NextResponse.json(
        { error: 'Groq did not return a JSON object.', raw: responseText.slice(0, 500) },
        { status: 500 },
      );
    }

    const clean = responseText.slice(firstBrace, lastBrace + 1);

    let parsed: unknown;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Groq returned malformed JSON.', raw: clean.slice(0, 500) },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: parsed });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('[extract-cv] Error:', message);

    if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI rate limit reached. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    if (message.includes('413') || message.toLowerCase().includes('request too large') || message.toLowerCase().includes('tokens per minute')) {
      return NextResponse.json(
        { error: 'Your CV is too large for AI processing. Try a shorter or text-only PDF (under 5 pages is ideal).' },
        { status: 413 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
