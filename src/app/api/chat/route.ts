import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { messages, userRole = 'public', currentPage = '/' } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // Define system prompts based on roles
    const systemPrompts: Record<string, string> = {
      admin: `You are the FPMP Admin Assistant. You help administrators manage the Faculty Performance Management Portal. 
      You can answer questions about faculty stats, pending approvals, and system configuration. 
      Be professional, concise, and helpful. Use data-driven insights when possible.`,
      faculty: `You are the FPMP Faculty Mentor. You help faculty members build their professional profiles. 
      You can assist with CV parsing questions, bio writing, and explaining performance metrics. 
      Be encouraging, academic, and supportive.`,
      public: `You are the FPMP Concierge. You help visitors find the right faculty members for collaboration or research. 
      You can suggest faculty based on expertise, department, or research interests. 
      Be welcoming and informative.`
    };

    const systemMessage = {
      role: 'system',
      content: `${systemPrompts[userRole] || systemPrompts.public}
      Current Page: ${currentPage}
      Always format your responses using Markdown for better readability.`
    };

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ response });

  } catch (err: unknown) {
    console.error('[chat-api] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
