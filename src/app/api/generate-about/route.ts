import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT =
  'You are an expert academic biographer. Write a detailed, professional, and compelling academic profile for Indian engineering college faculty. ' +
  'The bio MUST be strictly between 100 and 150 words. Do not exceed this limit. ' +
  'The bio should be in the third person. ' +
  'Structure it into exactly two paragraphs: ' +
  '1. Academic background, designation, department, and years of experience. ' +
  '2. Research interests, notable publications, awards, and professional contributions. ' +
  'Use a formal, authoritative, yet approachable tone. Do not use bullet points. ' +
  'IMPORTANT: Output ONLY the two paragraphs of the biography. Do not include any introductory or concluding remarks.';

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse and validate request body ───────────────────────────────
    const body = await request.json();
    const { 
      name, 
      designation, 
      department, 
      experience, 
      keywords = [], 
      education = [],
      publications = [],
      awards = [],
      certifications = []
    } = body;

    if (!name || !designation || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, designation, and department are required.' },
        { status: 400 },
      );
    }

    // ── 2. Validate API key ───────────────────────────────────────────────
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: GROQ_API_KEY is not set.' },
        { status: 500 },
      );
    }

    // ── 3. Build user prompt ──────────────────────────────────────────────
    const topKeywords = (keywords as string[]).slice(0, 8).join(', ') || 'N/A';
    const highestEdu = (education as any[])[0];
    const eduText = highestEdu
      ? `${highestEdu.degree} from ${highestEdu.institution}`
      : 'Not specified';
    
    const pubCount = publications.length;
    const awardCount = awards.length;
    const certCount = certifications.length;

    const userPrompt = [
      'Write a professional about paragraph for:',
      `Name: ${name}`,
      `Designation: ${designation}`,
      `Department: ${department}`,
      `Experience: ${experience || 'Not specified'}`,
      `Top keywords/Interests: ${topKeywords}`,
      `Highest education: ${eduText}`,
      `Research Output: ${pubCount} publications`,
      `Recognition: ${awardCount} awards/honors`,
      `Certifications: ${certCount} professional certifications`,
      `Notable Publication Examples: ${publications.slice(0, 2).map((p: any) => p.title).join(', ')}`,
    ].join('\n');

    // ── 4. Call Groq API ──────────────────────────────────────────────────
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.6,
    });

    const about = completion.choices[0]?.message?.content?.trim() ?? '';

    if (!about) {
      return NextResponse.json(
        { error: 'Groq returned an empty response.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ about });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('[generate-about] Error:', message);

    // Surface Groq rate-limit errors cleanly
    if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        { error: 'Groq rate limit exceeded (429). Please try again in a moment.' },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
