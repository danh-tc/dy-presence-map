import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Place } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "data", "places.json");

async function readPlaces(): Promise<Place[]> {
  return JSON.parse(await readFile(DATA_PATH, "utf-8"));
}

async function writePlaces(places: Place[]) {
  await writeFile(DATA_PATH, JSON.stringify(places, null, 2), "utf-8");
}

export async function GET() {
  try {
    const places = await readPlaces();
    return NextResponse.json(places);
  } catch {
    return NextResponse.json({ error: "Failed to read places" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Place = await request.json();
    if (!body.id || !body.slug || !body.name) {
      return NextResponse.json({ error: "id, slug, name required" }, { status: 400 });
    }
    const places = await readPlaces();
    if (places.some((p) => p.id === body.id)) {
      return NextResponse.json({ error: "id already exists" }, { status: 409 });
    }
    places.push(body);
    await writePlaces(places);
    return NextResponse.json(body, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create place" }, { status: 500 });
  }
}
