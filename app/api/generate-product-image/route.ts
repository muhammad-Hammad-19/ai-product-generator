import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imageKit";
import OpenAI from "openai";

export const runtime = "nodejs";

// =========================
// OPENAI INIT
// =========================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// =========================
// RETRY HELPER
// =========================

async function retry(fn: any, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;

      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
}

// =========================
// SYSTEM PROMPT
// =========================

const SYSTEM_PROMPT = `
You are a world-class product advertising creative director.

Analyze the image and return ONLY valid JSON:

{
  "textToImage": "...cinematic ad prompt...",
  "textToVideo": "...cinematic video prompt..."
}

Rules:
- ultra realistic
- studio lighting
- luxury commercial ad
- DO NOT change product
- only enhance background
`;
export async function POST(req: NextRequest) {
  
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");


    const originalUpload = await imagekit.upload({
      file: buffer,
      fileName: `original-${Date.now()}.jpg`,
      folder: "/campaigns/inputs",
    });

    const response = await retry(() =>
      openai.responses.create({
        model: "gpt-4.1-mini",

        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: SYSTEM_PROMPT,
              },
            ],
          },
        ],
      }),
    );

    const text = response.output_text;

    let aiJson;

    try {
      aiJson = JSON.parse(text);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI JSON parse failed",
          raw: text,
        },
        { status: 500 },
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      message: "AI Ad Generated using OpenAI",

      originalImageUrl: originalUpload.url,

      prompts: aiJson,
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error?.message || error,
      },
      { status: 500 },
    );
  }
}
