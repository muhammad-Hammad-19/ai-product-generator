// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imageKit";
import { openai } from "@/lib/openai";

const PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    const originalUpload = await imagekit.upload({
      file: buffer,
      fileName: `original-${Date.now()}.jpg`,
      folder: "/campaigns",
    });

    // ✅ Step 1: gpt-4.1-mini se prompts lo
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",  // ✅ "text" → "input_text"
              text: PROMPT,
            },
            {
              type: "input_image",  // ✅ sahi
              image_url: originalUpload.url,
            },
          ],
        },
      ],
    });

    const text = response.output_text.trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    let json = JSON.parse(cleaned);

    // ✅ Step 2: gpt-image-1 se image generate karo
    const image_generate_res = await openai.responses.create({
      model: "gpt-4.1-mini",  // ✅ gpt-4.1-mini image generate nahi karta
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",  // ✅ "input_file" → "input_text"
              text: json?.textToImage,
            },
            {
              type: "input_image",
              image_url: originalUpload.url,
            },
          ],
        },
      ],
      tools: [{ type: "image_generation" }],
    });

    // ✅ Typo fix: "image_genration_call" → "image_generation_call"
    const imageData = image_generate_res.output
      .filter((item: any) => item.type === "image_generation_call")
      .map((item: any) => item.result);

    const generatedImage = imageData[0];

    if (!generatedImage) {
      return NextResponse.json(
        { success: false, error: "Image generation failed" },
        { status: 500 }
      );
    }

    // ✅ base64 format sahi kiya
    const uploadImageFinalResult = await imagekit.upload({
      file: `data:image/png;base64,${generatedImage}`,  // ✅ ":" → ";" 
      fileName: `generated-${Date.now()}.jpg`,
      isPublished: true,
    });

    return NextResponse.json({
      success: true,
      generatedImageUrl: uploadImageFinalResult?.url,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || err,
    });
  }
}