import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Place } from "@/lib/types";
import { deriveGroups } from "../route";

const DATA_PATH = path.join(process.cwd(), "data", "places.json");

async function readPlaces(): Promise<Place[]> {
  return JSON.parse(await readFile(DATA_PATH, "utf-8"));
}

async function writePlaces(places: Place[]) {
  await writeFile(DATA_PATH, JSON.stringify(places, null, 2), "utf-8");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { groupLabel, addPlaceIds, removePlaceIds } = await request.json();
    const places = await readPlaces();

    const group = places.find((p) => p.groupId === id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    for (const p of places) {
      if (p.groupId === id) {
        if (groupLabel) p.groupLabel = groupLabel;
        if (removePlaceIds?.includes(p.id)) {
          const updated = { ...p };
          delete updated.groupId;
          delete updated.groupLabel;
          updated.slug = updated.id;
          Object.assign(p, updated);
        }
      }
      if (addPlaceIds?.includes(p.id)) {
        p.slug = group.slug;
        p.groupId = id;
        p.groupLabel = groupLabel ?? group.groupLabel;
      }
    }

    await writePlaces(places);
    return NextResponse.json(deriveGroups(places).find((g) => g.groupId === id) ?? null);
  } catch {
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const places = await readPlaces();

    for (const p of places) {
      if (p.groupId === id) {
        const slug = p.id;
        delete p.groupId;
        delete p.groupLabel;
        p.slug = slug;
      }
    }

    await writePlaces(places);
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
