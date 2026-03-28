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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const places = await readPlaces();
    const index = places.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    const updated = { ...places[index], ...body };
    // Clean up nulled optional fields
    if (!updated.groupId) {
      delete updated.groupId;
      delete updated.groupLabel;
    }
    places[index] = updated;
    await writePlaces(places);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update place" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const places = await readPlaces();
    const filtered = places.filter((p) => p.id !== id);
    if (filtered.length === places.length) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    await writePlaces(filtered);
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete place" }, { status: 500 });
  }
}
