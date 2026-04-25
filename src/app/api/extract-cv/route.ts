import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';

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
      return NextResponse.json(
        { error: 'Server configuration error: GROQ_API_KEY is not set.' },
        { status: 500 },
      );
    }

    // ── 3. Extract text from PDF using pdf-parse ──────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      pdfText = pdfData.text;
      await parser.destroy();
    } catch (parseErr) {
      console.error('[extract-cv] PDF parsing error:', parseErr);
      return NextResponse.json(
        { error: 'Failed to parse PDF. Ensure the file is a valid, text-based PDF.' },
        { status: 422 },
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or is a scanned image-only document.' },
        { status: 422 },
      );
    }

    // Trim to avoid exceeding context limits (~60k chars ≈ ~15k tokens)
    const truncatedText = pdfText.slice(0, 60000);

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
      max_tokens: 4000,
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
        { error: 'Groq rate limit exceeded (429). Please try again in a moment.' },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
