import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send a PDF as the "file" field.' },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds the 10 MB size limit." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set." },
        { status: 500 },
      );
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const path = `${user.id}/${Date.now()}.pdf`;

    const { data, error } = await admin.storage
      .from("cvs")
      .upload(path, file, { contentType: "application/pdf", upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

