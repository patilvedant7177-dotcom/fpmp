import { NextRequest, NextResponse } from "next/server";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export const runtime = "nodejs";

type PdfLine = { text: string; y: number; font: number };

async function extractPdfLines(buffer: Buffer): Promise<PdfLine[]> {
  // pdfjs-dist expects some DOM classes to exist, even for text extraction.
  // Provide minimal stubs for Node/serverless runtimes.
  const g = globalThis as any;
  if (typeof g.DOMMatrix === "undefined") g.DOMMatrix = class DOMMatrix {};
  if (typeof g.ImageData === "undefined") g.ImageData = class ImageData {};
  if (typeof g.Path2D === "undefined") g.Path2D = class Path2D {};

  // Use the legacy build for Node/serverless environments.
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any;
  if (pdfjs?.GlobalWorkerOptions) {
    // Prefer a real worker in Node (worker_threads). Use an absolute path so it
    // doesn't go through Turbopack chunk resolution.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const workerFsPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs") as string;
    pdfjs.GlobalWorkerOptions.workerSrc = workerFsPath;
  }
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;

  const allLines: PdfLine[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const items = (content.items ?? []) as any[];

    // Reconstruct lines using PDF text item positions.
    // `transform[4]` = x, `transform[5]` = y in user space.
    const byLine = new Map<number, { x: number; s: string; font: number }[]>();
    for (const it of items) {
      const s = it?.str ? String(it.str).trim() : "";
      if (!s) continue;
      const tr = it?.transform;
      const x = Array.isArray(tr) ? Number(tr[4] ?? 0) : 0;
      const yRaw = Array.isArray(tr) ? Number(tr[5] ?? 0) : 0;
      const font = Array.isArray(tr) ? Math.max(Math.abs(Number(tr[0] ?? 0)), Math.abs(Number(tr[3] ?? 0))) : 0;
      // Bucket y into “line rows” (tolerant to tiny float differences)
      const y = Math.round(yRaw * 2) / 2;
      const arr = byLine.get(y) ?? [];
      arr.push({ x, s, font });
      byLine.set(y, arr);
    }

    const ys = Array.from(byLine.keys()).sort((a, b) => b - a); // top -> bottom
    for (const y of ys) {
      const row = (byLine.get(y) ?? []).sort((a, b) => a.x - b.x);
      const parts = row.map((p) => p.s);
      // Collapse repeated whitespace
      const line = parts.join(" ").replace(/\s{2,}/g, " ").trim();
      if (!line) continue;
      const avgFont = row.reduce((acc, p) => acc + (p.font || 0), 0) / Math.max(1, row.length);
      allLines.push({ text: line, y, font: avgFont || 0 });
    }
  }
  return allLines;
}

function safeArray<T>(v: unknown, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function extractEmail(text: string): string {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0] ?? "";
}

function extractPhone(text: string): string {
  // Best-effort: supports Indian/international-ish formats
  const m = text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,5}[\s-]?\d{4}\b/);
  return m?.[0]?.trim() ?? "";
}

function extractUrl(text: string, kind: "linkedin" | "github"): string {
  const re =
    kind === "linkedin"
      ? /(https?:\/\/)?(www\.)?linkedin\.com\/[^\s)]+/i
      : /(https?:\/\/)?(www\.)?github\.com\/[^\s)]+/i;
  const m = text.match(re);
  if (!m?.[0]) return "";
  const raw = m[0].replace(/[.,;]+$/g, "");
  return raw.startsWith("http") ? raw : `https://${raw.replace(/^\/\//, "")}`;
}

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function isLikelyHeading(line: string): boolean {
  if (line.length > 40) return false;
  const upperRatio =
    line.replace(/[^A-Z]/g, "").length / Math.max(1, line.replace(/[^A-Za-z]/g, "").length);
  const hasColon = line.endsWith(":");
  const keywords = /(education|experience|skills|projects|certifications|summary|profile)/i.test(line);
  return hasColon || keywords || upperRatio > 0.8;
}

function sectionLines(lines: string[], headerRegex: RegExp): string[] {
  const idx = lines.findIndex((l) => headerRegex.test(l));
  if (idx === -1) return [];
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i]!;
    if (isLikelyHeading(l)) break;
    out.push(l);
    if (out.length > 120) break;
  }
  return out;
}

function extractSkills(lines: string[]): string[] {
  const block = sectionLines(lines, /^skills\b/i);
  if (block.length === 0) return [];
  const joined = block.join(" ");
  const tokens = joined
    .split(/[,|•·\u2022]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 40);
  return uniq(tokens).slice(0, 40);
}

function extractEducation(lines: string[]) {
  const block = sectionLines(lines, /^education\b/i);
  const src = block.length ? block : lines;
  const edu: Array<{ degree: string; institution: string; year: string }> = [];

  for (const l of src) {
    const year = (l.match(/\b(19|20)\d{2}\b/) ?? [])[0] ?? "";
    const degreeMatch =
      l.match(/\b(B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?Sc|M\.?Sc|Ph\.?D|MBA|BCA|MCA)\b/i) ?? null;
    if (!degreeMatch) continue;

    const degree = degreeMatch[0];
    const parts = l.split(/[-–|,]/).map((x) => x.trim()).filter(Boolean);
    const institution =
      parts.find((p) => /college|university|institute|school/i.test(p)) ??
      parts.find((p) => p !== degree && !/^(19|20)\d{2}$/.test(p)) ??
      "";

    edu.push({ degree, institution, year });
    if (edu.length >= 6) break;
  }

  return edu;
}

function extractExperience(lines: string[]) {
  const block = sectionLines(lines, /^experience\b/i);
  if (block.length === 0) return [];

  const out: Array<{ title: string; company: string; duration: string; description: string }> = [];
  let current: { title: string; company: string; duration: string; description: string } | null = null;

  for (const l of block) {
    const duration = (l.match(/\b((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}).{0,20}\b(Present|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i) ?? [])[0] ?? "";

    const isBullet = /^[-•\u2022]/.test(l);
    if (!isBullet && (duration || / at /i.test(l) || / \| /i.test(l))) {
      if (current) out.push(current);
      const clean = l.replace(/^[-•\u2022]\s*/, "");
      const parts = clean.split(/\s+\|\s+| at /i).map((x) => x.trim());
      const title = parts[0] ?? "";
      const company = parts[1] ?? "";
      current = { title, company, duration, description: "" };
      continue;
    }

    if (current) {
      const d = l.replace(/^[-•\u2022]\s*/, "").trim();
      if (d) current.description = current.description ? `${current.description}\n${d}` : d;
    }
  }

  if (current) out.push(current);
  return out.slice(0, 8);
}

function extractName(lines: string[], email: string, pdfLines?: PdfLine[]): string {
  // Heuristic: first line near top that's not contact info.
  // Also handles "Name: ..." and ALLCAPS headings.
  if (pdfLines?.length) {
    // Prefer the largest-font line among the top lines.
    const top = pdfLines
      .slice(0, 20)
      .filter((l) => l.text.length >= 2 && l.text.length <= 60)
      .filter((l) => !(email && l.text.includes(email)))
      .filter((l) => !/@/.test(l.text))
      .filter((l) => !/linkedin|github|phone|email/i.test(l.text))
      .sort((a, b) => b.font - a.font);
    for (const cand of top) {
      const cleaned = cand.text.replace(/\s{2,}/g, " ").trim();
      const nameLabel = cleaned.match(/^name\s*[:\-]\s*(.+)$/i);
      if (nameLabel?.[1] && nameLabel[1].trim().length <= 60) return nameLabel[1].trim();
      const words = cleaned.split(/\s+/).filter(Boolean);
      const alphaWords = words.filter((w) => /[A-Za-z]/.test(w));
      if (alphaWords.length >= 2 && alphaWords.length <= 5) return cleaned;
    }
  }
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const l = lines[i]!;
    const nameLabel = l.match(/^name\s*[:\-]\s*(.+)$/i);
    if (nameLabel?.[1] && nameLabel[1].trim().length <= 60) {
      return nameLabel[1].trim();
    }
    if (l.length < 2 || l.length > 40) continue;
    if (email && l.includes(email)) continue;
    if (/@/.test(l)) continue;
    if (/linkedin|github|phone|email/i.test(l)) continue;
    // Must contain letters
    if (!/[A-Za-z]/.test(l)) continue;
    const cleaned = l.replace(/\s{2,}/g, " ").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const alphaWords = words.filter((w) => /[A-Za-z]/.test(w));
    const capsWords = alphaWords.filter((w) => w === w.toUpperCase() && w.length > 1);

    // If it looks like a section heading and not a person name, skip.
    if (isLikelyHeading(cleaned) && capsWords.length < 2) continue;

    // Prefer likely name-like lines: 2-5 words, mostly letters.
    if (alphaWords.length >= 2 && alphaWords.length <= 5 && cleaned.length <= 40) {
      return cleaned;
    }

    // Fallback to any reasonable short line.
    return cleaned;
  }
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pdfBase64?: string };
    const pdfBase64 = body?.pdfBase64;

    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return NextResponse.json({ error: "Missing required field: pdfBase64" }, { status: 400 });
    }

    const cleanBase64 = pdfBase64.includes(",") ? pdfBase64.split(",").pop()! : pdfBase64;
    const approxBytes = Math.floor((cleanBase64.length * 3) / 4);
    if (approxBytes > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "File exceeds the 10 MB size limit." }, { status: 400 });
    }

    const buffer = Buffer.from(cleanBase64, "base64");
    const pdfLines = await extractPdfLines(buffer);
    const text = pdfLines.map((l) => l.text).join("\n");

    const lines = normalizeLines(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const linkedin = extractUrl(text, "linkedin");
    const github = extractUrl(text, "github");
    const name = extractName(lines, email, pdfLines);
    const skills = extractSkills(lines);
    const education = extractEducation(lines);
    const experience = extractExperience(lines);

    return NextResponse.json({
      data: {
        name,
        email,
        phone,
        linkedin,
        github,
        skills: safeArray<string>(skills),
        education: safeArray<{ degree: string; institution: string; year: string }>(education),
        experience: safeArray<{ title: string; company: string; duration: string; description: string }>(
          experience,
        ),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

