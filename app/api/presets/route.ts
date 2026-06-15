import { NextResponse } from "next/server";
import { createPreset, listPresets } from "@/services/presetService";

// Node runtime (the MongoDB driver is not Edge-compatible).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const presets = await listPresets();
    return NextResponse.json({ presets });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load presets", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, structure = "array", values, operation = null } = body ?? {};
    if (!name || !Array.isArray(values)) {
      return NextResponse.json({ error: "name and values[] are required" }, { status: 400 });
    }
    const preset = await createPreset({
      name,
      structure,
      values: values.map((v: unknown) => Number(v)).filter((n) => !Number.isNaN(n)),
      operation,
    });
    return NextResponse.json({ preset }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create preset", detail: String(err) },
      { status: 500 },
    );
  }
}
