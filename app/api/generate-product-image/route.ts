import { NextRequest, NextResponse } from "next/server";

import { imagekit } from "@/lib/imageKit";

import { GoogleGenAI, Type } from "@google/genai";

import { Client } from "@gradio/client";

import { removeBackground } from "@imgly/background-removal";

import sharp from "sharp";

export const runtime = "nodejs";

// ============================================
// GEMINI
// ============================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// ============================================
// RETRY HELPER
// ============================================

async function retry(fn: any, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.log(`Retry Attempt ${i + 1}`);

      if (i === retries - 1) throw err;

      await new Promise((resolve) =>
        setTimeout(resolve, delay * (i + 1))
      );
    }
  }
}

// ============================================
// SCHEMA
// ============================================

const responseSchema = {
  type: Type.OBJECT,

  properties: {
    backgroundPrompt: {
      type: Type.STRING,
      description: "Luxury cinematic advertisement background prompt",
    },

    textToVideo: {
      type: Type.STRING,
      description: "Luxury cinematic product video prompt",
    },
  },

  required: ["backgroundPrompt", "textToVideo"],
};

// ============================================
// MAIN PROMPT
// ============================================

const MAIN_PROMPT = `
You are a world-class luxury advertising creative director.

Analyze the uploaded product image carefully.

IMPORTANT RULES:
- DO NOT create a new product
- DO NOT change product shape
- DO NOT change logo
- DO NOT change branding
- DO NOT change product colors
- Product will already exist separately

Your job is ONLY to generate:
1. Cinematic advertisement background prompt
2. Cinematic video prompt

Style:
- Ultra realistic
- Luxury commercial ad
- Studio lighting
- Liquid splash
- Floating particles
- Cinematic composition
- Premium environment
- High-end advertising

Return ONLY valid JSON.
`;

// ============================================
// API ROUTE
// ============================================

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // FORM DATA
    // ============================================

    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No image uploaded",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================
    // IMAGE BUFFER
    // ============================================

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const base64Image = buffer.toString("base64");

    // ============================================
    // UPLOAD ORIGINAL
    // ============================================

    const originalUpload = await imagekit.upload({
      file: buffer,

      fileName: `original-${Date.now()}.png`,

      folder: "/campaigns/inputs",
    });

    // ============================================
    // REMOVE BACKGROUND
    // ============================================

    console.log("Removing Background...");

    const bgRemovedBlob = await removeBackground(buffer);

    const bgRemovedArrayBuffer =
      await bgRemovedBlob.arrayBuffer();

    const transparentProductBuffer = Buffer.from(
      bgRemovedArrayBuffer
    );

    // ============================================
    // UPLOAD TRANSPARENT PNG
    // ============================================

    const transparentUpload = await imagekit.upload({
      file: transparentProductBuffer,

      fileName: `transparent-${Date.now()}.png`,

      folder: "/campaigns/transparent",
    });

    // ============================================
    // GEMINI ANALYSIS
    // ============================================

    console.log("Generating AI Prompt...");

    const analysisResult: any = await retry(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",

        config: {
          responseMimeType: "application/json",

          responseSchema,
        },

        contents: [
          {
            role: "user",

            parts: [
              {
                text: `
${MAIN_PROMPT}

User Description:
${description || "None"}
                `,
              },

              {
                inlineData: {
                  mimeType: file.type || "image/png",

                  data: base64Image,
                },
              },
            ],
          },
        ],
      })
    );

    // ============================================
    // CLEAN JSON
    // ============================================

    const rawText = analysisResult.text || "";

    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiJson;

    try {
      aiJson = JSON.parse(cleanedText);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON from Gemini",
          raw: cleanedText,
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // GENERATE ONLY BACKGROUND
    // ============================================

    console.log("Generating AI Background...");

    const client = await retry(() =>
      Client.connect("mrfakename/Z-Image-Turbo")
    );

    const backgroundResult: any = await retry(() =>
      client.predict("/generate_image", {
        prompt: `
${aiJson.backgroundPrompt}

IMPORTANT:
- NO product
- Empty center composition
- Product placement space in middle
- Cinematic commercial background only
- Ultra realistic
        `,

        height: 1024,

        width: 1024,

        num_inference_steps: 10,

        seed: 42,

        randomize_seed: true,
      })
    );

    console.log("BACKGROUND RESULT:", backgroundResult);

    // ============================================
    // EXTRACT BG URL
    // ============================================

    let backgroundImageUrl = "";

    if (backgroundResult?.data?.[0]?.url) {
      backgroundImageUrl = backgroundResult.data[0].url;
    } else if (
      typeof backgroundResult?.data?.[0] === "string"
    ) {
      backgroundImageUrl = backgroundResult.data[0];
    }

    if (!backgroundImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Background generation failed",
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // DOWNLOAD AI BACKGROUND
    // ============================================

    console.log("Downloading AI Background...");

    const backgroundResponse = await fetch(
      backgroundImageUrl
    );

    const backgroundArrayBuffer =
      await backgroundResponse.arrayBuffer();

    const backgroundBuffer = Buffer.from(
      backgroundArrayBuffer
    );

    // ============================================
    // RESIZE PRODUCT
    // ============================================

    console.log("Resizing Product...");

    const resizedProduct = await sharp(
      transparentProductBuffer
    )
      .resize({
        width: 500,
      })
      .png()
      .toBuffer();

    // ============================================
    // GET PRODUCT SIZE
    // ============================================

    const metadata = await sharp(resizedProduct).metadata();

    const productWidth = metadata.width || 500;

    const productHeight = metadata.height || 500;

    // ============================================
    // COMPOSITE FINAL IMAGE
    // ============================================

    console.log("Compositing Final Ad...");

    const finalComposite = await sharp(backgroundBuffer)
      .resize(1024, 1024)

      .composite([
        {
          input: resizedProduct,

          gravity: "center",

          top: Math.floor(
            (1024 - productHeight) / 2
          ),

          left: Math.floor(
            (1024 - productWidth) / 2
          ),
        },
      ])

      .jpeg({
        quality: 95,
      })

      .toBuffer();

    // ============================================
    // UPLOAD FINAL IMAGE
    // ============================================

    console.log("Uploading Final AI Ad...");

    const finalUpload = await imagekit.upload({
      file: finalComposite,

      fileName: `final-ad-${Date.now()}.jpg`,

      folder: "/campaigns/final",
    });

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,

      message: "Luxury AI Advertisement Generated",

      originalImageUrl: originalUpload.url,

      transparentProductUrl: transparentUpload.url,

      backgroundImageUrl,

      generatedImageUrl: finalUpload.url,

      prompts: aiJson,
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Internal Server Error",

        details: error?.message || "Unknown Error",
      },
      {
        status: 500,
      }
    );
  }
}