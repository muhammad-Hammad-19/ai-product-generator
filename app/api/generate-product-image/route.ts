import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imageKit"; // Jo util humne pehle banayi thi
import { openai } from "@/lib/openai";

const PROMT =
  '"Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material. Use a clean, colorful background to make the product stand out. Include ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed. Also give me image to video prompt for same in JSON format: {textToImage, textToVideo}"';
export async function POST(request: NextRequest) {
  try {
    // 1. Request se FormData ko extract karein
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;

    // Validation check
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in formData" },
        { status: 400 },
      );
    }

    // 3. File ko buffer mein convert karein kyunki ImageKit server-side par buffer accept karta hai
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    // 4. ImageKit Node.js SDK ka use karte hue direct upload karein

    const uploadResponse = await imagekit.upload({
      file: buffer, // Passing binary buffer data
      fileName: file.name || "campaign-asset.jpg", // File ka naam
      folder: "/campaigns",
    });
    
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: PROMT,
            },
          ],
        },
      ],
    });

    // 5. Success response return karein (Isme image ka CDN url aur description dono milenge)
    return NextResponse.json(
      {
        success: true,
        message: "Asset uploaded successfully to ImageKit backend!",
        imageUrl: uploadResponse.url, // ImageKit CDN URL
        description: description, // Baqi form data jo aapne bhejatha
        ai: response,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Server-side ImageKit Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed on server", details: error?.message },
      { status: 500 },
    );
  }
}
