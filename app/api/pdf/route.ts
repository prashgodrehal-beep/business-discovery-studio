import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import BlueprintDocument from "@/lib/pdf/BlueprintDocument";
import { BusinessProfile, GeneratedResults } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let profile: BusinessProfile;
  let results: GeneratedResults;
  try {
    const body = await req.json();
    profile = body.profile;
    results = body.results;
    if (!profile || !results) {
      return NextResponse.json({ error: "missing_data" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const buffer = await renderToBuffer(BlueprintDocument({ profile, results }));
    const industrySlug = (profile.company.industry || "blueprint").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ai-transformation-blueprint-${industrySlug}.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "render_failed", message: (err as Error).message }, { status: 500 });
  }
}
