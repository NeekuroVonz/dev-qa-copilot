// src/app/api/testcases/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiRequests } from "@/db/schema";
import { handleGenerateTestCases } from "@/lib/ai";
import type { TestCaseRequest } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as TestCaseRequest;

  if (!body.requirement?.trim()) {
    return NextResponse.json(
      { error: "Requirement is required" },
      { status: 400 },
    );
  }

  const result = await handleGenerateTestCases(body);

  await db.insert(aiRequests).values({
    type: "testcases",
    input: body.requirement,
    output: JSON.stringify(result),
    createdAt: new Date(),
  });

  return NextResponse.json(result);
}
