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
  "idealCustomer": string (a short phrase, 3-6 words, e.g. "mid-size industrial manufacturers"),
  "buyingCycle": "Days" | "Weeks" | "1-3 months" | "3-6 months" | "6+ months" | null,
  "customerJourney": string[] (0-3 of: "inbound", "referral", "outbound", "events", "partner"),
  "supportExpectations": string[] (0-2 of: "24x7", "business_hours", "self_serve", "white_glove"),
  "repeatBusiness": "low" | "medium" | "high" | null,
  "confidence": "high" | "medium" | "low"
}
Only fill buyingCycle, customerJourney, supportExpectations, or repeatBusiness when the homepage text actually signals them — leave null / an empty array rather than guessing. A sensible business-model-based default will be applied for anything left blank, so guessing here just adds noise.
If the homepage gives too little signal for industry/businessModel/productsServices, use your best reasonable guess for those three and set confidence to "low". Never leave industry or businessModel empty.`;

// Business-model-based fallback for whichever customer-profile fields Claude
// couldn't confidently read from the copy. These are generic priors, not
// anything scraped — kept separate so the UI can be honest about which is which.
function applyBusinessModelDefaults(result: EnrichmentResult): { result: EnrichmentResult; defaultedFields: string[] } {
  const defaults: Record<string, { buyingCycle: string; customerJourney: string[]; supportExpectations: string[]; repeatBusiness: string }> = {
    B2B: { buyingCycle: "1-3 months", customerJourney: ["outbound", "referral"], supportExpectations: ["business_hours"], repeatBusiness: "medium" },
    B2C: { buyingCycle: "Days", customerJourney: ["inbound"], supportExpectations: ["self_serve"], repeatBusiness: "medium" },
    Both: { buyingCycle: "Weeks", customerJourney: ["inbound", "referral"], supportExpectations: ["business_hours"], repeatBusiness: "medium" },
  };
  const fallback = defaults[result.businessModel ?? "B2B"] ?? defaults.B2B;
  const defaultedFields: string[] = [];

  if (!result.buyingCycle) {
    result.buyingCycle = fallback.buyingCycle;
    defaultedFields.push("buying cycle");
  }
  if (!result.customerJourney || result.customerJourney.length === 0) {
    result.customerJourney = fallback.customerJourney;
    defaultedFields.push("customer journey");
  }
  if (!result.supportExpectations || result.supportExpectations.length === 0) {
    result.supportExpectations = fallback.supportExpectations;
    defaultedFields.push("support expectations");
  }
  if (!result.repeatBusiness) {
    result.repeatBusiness = fallback.repeatBusiness;
    defaultedFields.push("repeat business");
  }
  return { result, defaultedFields };
}

// Deterministic (no AI) signal detection straight from the raw HTML — CMS
// generator tags and common integration links. Only maps to a tech category
// when the signal is unambiguous; skips anything that would be a guess.
function detectTechSignals(html: string): Record<string, string[]> {
  const detected: Record<string, string[]> = {};
  const lower = html.toLowerCase();

  const generatorMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
  const generator = generatorMatch?.[1]?.toLowerCase() ?? "";
  if (generator.includes("wordpress") || lower.includes("wp-content")) detected.website = ["WordPress"];
  else if (generator.includes("wix")) detected.website = ["Other"];
  else if (lower.includes("webflow.com") || lower.includes("data-wf-page")) detected.website = ["Webflow"];

  if (lower.includes("wa.me/") || lower.includes("api.whatsapp.com")) detected.whatsapp = ["API"];
  if (lower.includes("calendly.com") || lower.includes("cal.com/")) detected.calendar = ["Other"];

  return detected;
}

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

  const techStackDetected = detectTechSignals(html);

  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  $("script, style, noscript, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

  if (!title && !metaDescription && bodyText.length < 100) {
    return NextResponse.json({ error: "insufficient_content", techStackDetected }, { status: 200 });
  }

  const userPrompt = `Page title: ${title}\nMeta description: ${metaDescription}\nHomepage text: ${bodyText}`;

  try {
    const raw = await callClaude(SYSTEM_PROMPT, userPrompt, 500);
    const parsed = parseJsonResponse<EnrichmentResult>(raw);
    const { result, defaultedFields } = applyBusinessModelDefaults(parsed);
    return NextResponse.json({ result, defaultedFields, techStackDetected });
  } catch (err) {
    return NextResponse.json({ error: "inference_failed", message: (err as Error).message, techStackDetected }, { status: 200 });
  }
}
