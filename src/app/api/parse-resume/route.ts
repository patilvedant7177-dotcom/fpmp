import { NextRequest, NextResponse } from "next/server";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export const runtime = "nodejs";

function pickString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function pickArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function mapApilayerToShape(raw: any) {
  const basics = raw?.basics ?? raw?.basic ?? raw?.data?.basics ?? {};

  const name =
    pickString(raw?.name) ||
    pickString(basics?.name) ||
    pickString(raw?.full_name) ||
    pickString(raw?.fullName) ||
    pickString(raw?.candidate_name) ||
    pickString(raw?.personal?.name);
  const email =
    pickString(raw?.email) ||
    pickString(basics?.email) ||
    pickString(raw?.personal?.email) ||
    pickString(raw?.contact?.email);
  const phone =
    pickString(raw?.phone) ||
    pickString(basics?.phone) ||
    pickString(raw?.personal?.phone) ||
    pickString(raw?.contact?.phone);

  const profiles = pickArray(raw?.profiles ?? basics?.profiles);
  const linkedin =
    pickString(raw?.linkedin) ||
    pickString(
      (profiles.find((p: any) => /linkedin/i.test(p?.network ?? p?.type ?? "")) as any)?.url ??
        (profiles.find((p: any) => /linkedin/i.test(p?.url ?? "")) as any)?.url,
    );
  const github =
    pickString(raw?.github) ||
    pickString(
      (profiles.find((p: any) => /github/i.test(p?.network ?? p?.type ?? "")) as any)?.url ??
        (profiles.find((p: any) => /github/i.test(p?.url ?? "")) as any)?.url,
    );

  const skillsRaw = raw?.skills ?? raw?.skill ?? raw?.data?.skills;
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw
        .map((s: any) => (typeof s === "string" ? s : s?.name ?? s?.skill ?? ""))
        .map((s: any) => String(s).trim())
        .filter(Boolean)
    : [];

  const educationRaw =
    raw?.education ??
    raw?.educations ??
    raw?.data?.education ??
    raw?.data?.educations ??
    raw?.education_history ??
    raw?.educationHistory;
  const education = pickArray(educationRaw)
    .map((e: any) => ({
      degree: pickString(e?.degree) || pickString(e?.qualification) || pickString(e?.studyType),
      institution: pickString(e?.institution) || pickString(e?.school) || pickString(e?.university),
      year:
        pickString(e?.year) ||
        pickString(e?.endDate) ||
        pickString(e?.graduationYear) ||
        pickString(e?.date),
    }))
    .filter((e: any) => e.degree || e.institution || e.year);

  const expRaw =
    raw?.experience ?? raw?.experiences ?? raw?.work ?? raw?.employment ?? raw?.data?.experience ?? raw?.data?.work;
  const experience = pickArray(expRaw)
    .map((x: any) => ({
      title: pickString(x?.title) || pickString(x?.position) || pickString(x?.jobTitle),
      company: pickString(x?.company) || pickString(x?.organization) || pickString(x?.employer),
      duration:
        pickString(x?.duration) ||
        [pickString(x?.startDate), pickString(x?.endDate)].filter(Boolean).join(" - "),
      description: pickString(x?.description) || pickString(x?.summary) || pickString(x?.responsibilities),
    }))
    .filter((x: any) => x.title || x.company || x.duration || x.description);

  return {
    name,
    email,
    phone,
    linkedin,
    github,
    skills,
    education,
    experience,
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESUME_PARSER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: RESUME_PARSER_API_KEY is not set." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { pdfBase64?: string };
    const pdfBase64 = body?.pdfBase64;

    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return NextResponse.json({ error: "Missing required field: pdfBase64" }, { status: 400 });
    }

    // If the client accidentally sends a data URL, strip prefix.
    const cleanBase64 = pdfBase64.includes(",") ? pdfBase64.split(",").pop()! : pdfBase64;

    // Rough size validation: base64 inflates by ~4/3
    const approxBytes = Math.floor((cleanBase64.length * 3) / 4);
    if (approxBytes > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "File exceeds the 10 MB size limit." }, { status: 400 });
    }

    try {
      const buffer = Buffer.from(cleanBase64, "base64");

      // APILayer Resume Parser docs specify application/octet-stream upload.
      // Endpoint: POST https://api.apilayer.com/resume_parser/upload
      const res = await fetch("https://api.apilayer.com/resume_parser/upload", {
        method: "POST",
        headers: {
          apikey: apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error("API_FAILED");
      }

      const raw = await res.json().catch(() => null);
      if (!raw) {
        throw new Error("API_FAILED");
      }

      const mapped = mapApilayerToShape(raw);
      return NextResponse.json({ data: mapped });
    } catch (e) {
      // Signal to frontend that it should use the local fallback parser.
      const message = e instanceof Error ? e.message : "API_FAILED";
      if (message === "API_FAILED") {
        return NextResponse.json({ error: "API_FAILED" }, { status: 500 });
      }
      return NextResponse.json({ error: "API_FAILED" }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

