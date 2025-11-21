// src/lib/ai.ts
import "server-only";
import {Mistral} from "@mistralai/mistralai";

import type {
  EmailHelperRequest,
  EmailHelperResponse,
  ExplainFixRequest,
  ExplainFixResponse,
  TestCaseItem,
  TestCaseRequest,
  TestCaseResponse,
} from "@/types/ai";

// ======================================================
// MISTRAL CLIENT SETUP
// ======================================================

const mistralApiKey = process.env.MISTRAL_API_KEY ?? "";
const mistralModel = process.env.MISTRAL_MODEL ?? "mistral-small-latest";

// Bật / tắt AI dựa trên việc có API key hay không
const AI_ENABLED = !!mistralApiKey;

// Singleton client cho toàn bộ server
const mistral = AI_ENABLED
  ? new Mistral({
    apiKey: mistralApiKey,
    // serverURL: "https://api.mistral.ai", // mặc định đã là endpoint chính
  })
  : null;

/**
 * Gọi LLM Mistral (hoặc trả mock nếu chưa cấu hình).
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!AI_ENABLED || !mistral) {
    // Fallback mock để demo khi chưa cấu hình API key
    return [
      "[Mock Mistral output]",
      "",
      "System prompt:",
      systemPrompt,
      "",
      "User prompt:",
      userPrompt,
    ].join("\n");
  }

  const res = await mistral.chat.complete({
    model: mistralModel,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const choice = res.choices?.[0];
  const messageContent = choice?.message?.content;

  if (!messageContent) return "";

  if (typeof messageContent === "string") {
    return messageContent;
  }

  // Nếu content là array segment thì join lại
  return messageContent
    .map((part: any) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      return "";
    })
    .join("");
}

// ======================================================
// EXPLAIN & FIX
// ======================================================

export async function handleExplainFix(
  payload: ExplainFixRequest,
): Promise<ExplainFixResponse> {
  const {type, content, language} = payload;

  const systemPrompt =
    language === "vi"
      ? "Bạn là một senior developer, hãy phân tích code / SQL / log chi tiết nhưng dễ hiểu."
      : "You are a senior software engineer. Explain the provided code / SQL / log clearly and concisely.";

  const userPrompt = [
    `Type: ${type}`,
    "",
    "Content:",
    "```",
    content,
    "```",
    "",
    language === "vi"
      ? "1) Giải thích đoạn nội dung trên đang làm gì.\n2) Nếu có vấn đề, bug hoặc mùi code, hãy liệt kê.\n3) Đề xuất cách sửa hoặc tối ưu (ngắn gọn)."
      : "1) Explain what this does.\n2) List any potential bugs, issues, or code smells.\n3) Suggest how to fix or improve it (briefly).",
  ].join("\n");

  const text = await callLLM(systemPrompt, userPrompt);

  // Ở đây mình coi toàn bộ text là explanation,
  // bạn có thể tách thành issues/suggestions sau nếu muốn.
  return {
    explanation: text,
    issues: [],
    suggestions: [],
  };
}

// ======================================================
// TEST CASE GENERATOR
// ======================================================
function extractJsonArray(text: string): any[] {
  const trimmed = text.trim();

  // 1) Nếu có ```json ... ``` hoặc ``` ... ```
  const fenceMatch =
    trimmed.match(/```json([\s\S]*?)```/i) ||
    trimmed.match(/```([\s\S]*?)```/);

  let jsonCandidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  // 2) Cắt lấy đoạn từ [ ... ] đầu tiên
  const start = jsonCandidate.indexOf("[");
  const end = jsonCandidate.lastIndexOf("]");

  if (start !== -1 && end !== -1 && end > start) {
    jsonCandidate = jsonCandidate.slice(start, end + 1);
  }

  // 3) Parse JSON
  return JSON.parse(jsonCandidate);
}

export async function handleGenerateTestCases(
  payload: TestCaseRequest,
): Promise<TestCaseResponse> {
  const {requirement, language, includeBoundary} = payload;

  const systemPrompt =
    language === "vi"
      ? "Bạn là QA engineer, hãy tạo test cases đầy đủ, rõ ràng, dễ hiểu."
      : "You are a QA engineer. Create clear, detailed test cases.";

  const extraInstr =
    language === "vi"
      ? includeBoundary
        ? "Bao gồm cả test case boundary và negative case."
        : "Có thể bỏ qua boundary case nếu không cần."
      : includeBoundary
        ? "Include boundary and negative cases."
        : "Boundary cases are optional.";

  const jsonFormatHint =
    language === "vi"
      ? `Trả về **DUY NHẤT** một JSON array, KHÔNG giải thích thêm, KHÔNG dùng \`\`\`json\`\`\`.
Ví dụ:
[
  {
    "id": "TC-001",
    "title": "Title",
    "steps": "Step 1...\\nStep 2...",
    "expected": "Expected result",
    "priority": "High"
  }
]`
      : `Return ONLY a JSON array, NO extra text, NO \`\`\`json\`\`\` fences.
Example:
[
  {
    "id": "TC-001",
    "title": "Title",
    "steps": "Step 1...\\nStep 2...",
    "expected": "Expected result",
    "priority": "High"
  }
]`;

  const userPrompt = [
    "Requirement:",
    "```",
    requirement,
    "```",
    "",
    extraInstr,
    "",
    jsonFormatHint,
  ].join("\n");

  const text = await callLLM(systemPrompt, userPrompt);

  // Nếu chưa bật AI → trả mock 3 test case để demo
  if (!AI_ENABLED) {
    const mock: TestCaseItem[] = [
      {
        id: "TC-001",
        title:
          language === "vi"
            ? "Happy path - dữ liệu hợp lệ"
            : "Happy path - valid data",
        steps:
          language === "vi"
            ? "1. Nhập dữ liệu hợp lệ\n2. Submit form"
            : "1. Enter valid data\n2. Submit the form",
        expected:
          language === "vi"
            ? "Hệ thống xử lý thành công theo mô tả requirement."
            : "System successfully processes the request according to the requirement.",
        priority: "High",
      },
      {
        id: "TC-002",
        title:
          language === "vi"
            ? "Dữ liệu không hợp lệ"
            : "Invalid input validation",
        steps:
          language === "vi"
            ? "1. Nhập giá trị không hợp lệ\n2. Submit form"
            : "1. Enter invalid values\n2. Submit the form",
        expected:
          language === "vi"
            ? "Hệ thống hiển thị thông báo lỗi phù hợp."
            : "System shows proper validation error message.",
        priority: "Medium",
      },
      {
        id: "TC-003",
        title:
          language === "vi" ? "Boundary value" : "Boundary value handling",
        steps:
          language === "vi"
            ? "1. Nhập giá trị boundary\n2. Submit form"
            : "1. Enter boundary value\n2. Submit the form",
        expected:
          language === "vi"
            ? "Hệ thống xử lý đúng boundary case, không crash."
            : "System handles the boundary correctly and does not crash.",
        priority: "Medium",
      },
    ];

    return {testCases: mock};
  }

  // Nếu có AI: cố gắng extract JSON array từ text
  try {
    const parsed = extractJsonArray(text);
    const testCases: TestCaseItem[] = parsed.map((item: any, idx: number) => ({
      id: item.id ?? `TC-${String(idx + 1).padStart(3, "0")}`,
      title: item.title ?? "",
      steps: item.steps ?? "",
      expected: item.expected ?? "",
      priority: (item.priority ?? "Medium") as "Low" | "Medium" | "High",
    }));

    return { testCases };
  } catch {
    // Nếu parse fail, dùng fallback 1 test case như cũ
    const fallback: TestCaseItem = {
      id: "TC-001",
      title:
        language === "vi"
          ? "Test case từ AI (cần review lại)"
          : "AI generated test case (needs review)",
      steps: text,
      expected:
        language === "vi"
          ? "Kiểm tra và chỉnh sửa lại test case cho phù hợp."
          : "Review and adjust this test case as needed.",
      priority: "Medium",
    };

    return { testCases: [fallback] };
  }
}

// ======================================================
// EMAIL HELPER
// ======================================================
function extractJsonObject(text: string): any {
  const trimmed = text.trim();

  // 1) Tìm code block ```json ... ``` hoặc ``` ... ```
  const fenceMatch =
    trimmed.match(/```json([\s\S]*?)```/i) ||
    trimmed.match(/```([\s\S]*?)```/);

  let jsonCandidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  // 2) Cắt đoạn từ { ... } đầu–cuối
  const start = jsonCandidate.indexOf("{");
  const end = jsonCandidate.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    jsonCandidate = jsonCandidate.slice(start, end + 1);
  }

  // 3) Parse JSON
  return JSON.parse(jsonCandidate);
}

export async function handleEmailHelper(
  payload: EmailHelperRequest,
): Promise<EmailHelperResponse> {
  const {note, language, tone} = payload;

  const toneTextMap: Record<string, string> =
    language === "vi"
      ? {
        client: "Trang trọng, chuyên nghiệp, gửi khách hàng.",
        manager: "Trang trọng, súc tích, gửi quản lý.",
        internal: "Thân thiện, tự nhiên, nội bộ team.",
      }
      : {
        client: "Formal, professional tone for client.",
        manager: "Formal and concise tone for manager.",
        internal: "Friendly, internal team tone.",
      };

  const systemPrompt =
    language === "vi"
      ? "Bạn là software engineer, hãy viết email tiếng Việt đúng ngữ pháp, rõ ràng, dễ hiểu."
      : "You are a software engineer. Write a polished, professional English email.";

  const jsonHint =
    language === "vi"
      ? 'Trả về **DUY NHẤT** một JSON object, KHÔNG giải thích thêm, KHÔNG dùng ```json```.\nVí dụ: { "subject": "...", "body": "..." }'
      : 'Return ONLY a JSON object, NO extra text, NO ```json``` fences.\nExample: { "subject": "...", "body": "..." }';

  const userPrompt = [
    `Tone: ${toneTextMap[tone]}`,
    "",
    "Ghi chú thô / rough notes:",
    "```",
    note,
    "```",
    "",
    jsonHint,
  ].join("\n");

  const text = await callLLM(systemPrompt, userPrompt);

  // Nếu chưa config AI → mock email
  if (!AI_ENABLED) {
    return {
      subject:
        language === "vi"
          ? "[Mock] Báo cáo tiến độ công việc"
          : "[Mock] Status update",
      body:
        language === "vi"
          ? [
            "Dear anh/chị,",
            "",
            "Đây là nội dung email mock. Vui lòng cấu hình MISTRAL_API_KEY để sử dụng AI thật.",
            "",
            "Trân trọng,",
            "Dev & QA CoPilot",
          ].join("\n")
          : [
            "Dear all,",
            "",
            "This is a mocked email body. Please configure MISTRAL_API_KEY to use real AI.",
            "",
            "Best regards,",
            "Dev & QA CoPilot",
          ].join("\n"),
    };
  }

  // Nếu có AI, cố gắng parse JSON
  try {
    const parsed = extractJsonObject(text) as { subject?: string; body?: string };
    return {
      subject: parsed.subject ?? "(no subject)",
      body: parsed.body ?? "",
    };
  } catch {
    // Nếu parse fail, dùng toàn bộ text làm body
    return {
      subject: language === "vi" ? "(Không có tiêu đề)" : "(No subject)",
      body: text,
    };
  }
}
