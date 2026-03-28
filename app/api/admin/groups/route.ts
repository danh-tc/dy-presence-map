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

export function deriveGroups(places: Place[]) {
  const map = new Map<string, { groupId: string; groupLabel: string; slug: string; places: Place[] }>();
  for (const p of places) {
    if (!p.groupId) continue;
    if (!map.has(p.groupId)) {
      map.set(p.groupId, {
        groupId: p.groupId,
        groupLabel: p.groupLabel ?? p.groupId,
        slug: p.slug,
        places: [],
      });
    }
    map.get(p.groupId)!.places.push(p);
  }
  return Array.from(map.values());
}

export async function GET() {
  try {
    const places = await readPlaces();
    return NextResponse.json(deriveGroups(places));
  } catch {
    return NextResponse.json({ error: "Failed to read groups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { groupLabel, slug, placeIds } = await request.json();
    if (!groupLabel || !slug || !Array.isArray(placeIds) || placeIds.length < 2) {
      return NextResponse.json(
        { error: "groupLabel, slug, and at least 2 placeIds required" },
        { status: 400 }
      );
    }
    const places = await readPlaces();
    for (const p of places) {
      if (placeIds.includes(p.id)) {
        p.slug = slug;
        p.groupId = slug;
        p.groupLabel = groupLabel;
      }
    }
    await writePlaces(places);
    return NextResponse.json(deriveGroups(places).find((g) => g.groupId === slug), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
