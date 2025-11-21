// src/app/api/explain-fix/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiRequests } from "@/db/schema";
import { handleExplainFix } from "@/lib/ai";
import type { ExplainFixRequest } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as ExplainFixRequest;

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const result = await handleExplainFix(body);

  await db.insert(aiRequests).values({
    type: "explain",
    input: body.content,
    output: JSON.stringify(result),
    createdAt: new Date(),
  });

  return NextResponse.json(result);
}
