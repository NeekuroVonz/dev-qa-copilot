// src/app/api/email-helper/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiRequests } from "@/db/schema";
import { handleEmailHelper } from "@/lib/ai";
import type { EmailHelperRequest } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as EmailHelperRequest;

  if (!body.note?.trim()) {
    return NextResponse.json(
      { error: "Note is required" },
      { status: 400 },
    );
  }

  const result = await handleEmailHelper(body);

  await db.insert(aiRequests).values({
    type: "email",
    input: body.note,
    output: JSON.stringify(result),
    createdAt: new Date(),
  });

  return NextResponse.json(result);
}
