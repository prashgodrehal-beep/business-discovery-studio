import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { callClaude, parseJsonResponse } from "@/lib/anthropic";
import { EnrichmentResult } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You infer a business profile from a single homepage's visible text.
You will be given a page title, meta description, and homepage body text.
Respond with ONLY a JSON object, no markdown fences, no preamble, matching exactly this shape:
{
  "industry": string,
  "businessModel": "B2B" | "B2C" | "Both",
  "productsServices": string[] (2-5 short tags),
  "growthObjectives": string[] (0-3 of: "scale_sales", "cut_costs", "new_market", "retention" — only include ones the copy actually signals),
  "confidence": "high" | "medium" | "low"
}
If the homepage gives too little signal, use your best reasonable guess for industry/businessModel/productsServices and set confidence to "low". Never leave industry or businessModel empty.`;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = normalizeUrl(body.url ?? "");
    if (!url) return NextResponse.json({ error: "missing_url" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Fetch just the homepage, with a timeout — this is a live-demo tool, it
  // can't hang for 20 seconds on a slow or unreachable site.
  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DiscoveryStudioBot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return NextResponse.json({ error: "fetch_failed", status: res.status }, { status: 200 });
    }
    html = await res.text();
  } catch {
    // Site unreachable, blocked, or too slow — hand back a clear "couldn't
    // enrich" signal so the UI falls back to manual entry gracefully.
    return NextResponse.json({ error: "fetch_failed" }, { status: 200 });
  }

  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  $("script, style, noscript, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

  if (!title && !metaDescription && bodyText.length < 100) {
    return NextResponse.json({ error: "insufficient_content" }, { status: 200 });
  }

  const userPrompt = `Page title: ${title}\nMeta description: ${metaDescription}\nHomepage text: ${bodyText}`;

  try {
    const raw = await callClaude(SYSTEM_PROMPT, userPrompt, 400);
    const result = parseJsonResponse<EnrichmentResult>(raw);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: "inference_failed", message: (err as Error).message }, { status: 200 });
  }
}
