// Data access for saved visualizer presets, backed by MongoDB.

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Preset {
  _id?: string;
  name: string;
  structure: "array" | "linkedList" | "tree" | "graph";
  values: number[];
  operation?: string | null;
  createdAt: Date;
}

const COLLECTION = "presets";

export async function listPresets(): Promise<Preset[]> {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return docs.map((d) => ({ ...d, _id: d._id.toString() })) as Preset[];
}

export async function createPreset(
  input: Omit<Preset, "_id" | "createdAt">,
): Promise<Preset> {
  const db = await getDb();
  const doc = { ...input, createdAt: new Date() };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId.toString() };
}

export async function deletePreset(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
