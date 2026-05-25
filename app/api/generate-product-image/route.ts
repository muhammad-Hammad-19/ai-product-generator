// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imageKit";
import { openai } from "@/lib/openai";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";

const PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;
const AVATAR_PROMPT = `Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way. The avatar should look friendly and engaging, presenting the product seamlessly for a social media ad. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const size = (formData.get("size") as string) || "1024x1024";
    const description = (formData.get("description") as string) || "";
    const userEmail = (formData.get("userEmail") as string) || "";
    const avatar = (formData.get("avatar") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User not logged in" },
        { status: 401 },
      );
    }

    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userDoc = snapshot.docs[0];
    const userInfo = userDoc.data();

    const docId = Date.now().toString();
    await setDoc(doc(db, "users-ads", docId), {
      userEmail: userEmail,
      status: "pending",
      size,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    const originalUpload = await imagekit.upload({
      file: buffer,
      fileName: `original-${Date.now()}.jpg`,
      folder: "/campaigns",
    });

    const finalPrompt = description
      ? `${PROMPT}\n\nExtra context: ${description}`
      : PROMPT;

    // ✅ 1. stream/consumers import hataya — response.output_text use karo
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: avatar?.length > 2 ? AVATAR_PROMPT : finalPrompt,
            },
            { type: "input_image", image_url: originalUpload.url },
          ],
        },
      ],
    });

    // ✅ 2. text variable sahi se banao
    const rawText = response.output_text.trim();
    const match = rawText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON found in GPT response: " + rawText);
    }
    let json = JSON.parse(match[0]);

    // Image generate
    const image_generate_res = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${json?.textToImage}. Image size: ${size}`,
            },
            { type: "input_image", image_url: originalUpload.url },
            // ✅ 3. avatar image type fix
            ...(avatar?.length > 2
              ? [{ type: "input_image", image_url: avatar }]
              : []),
          ],
        },
      ],
      tools: [{ type: "image_generation" }],
    });

    const imageData = image_generate_res.output
      .filter((item: any) => item.type === "image_generation_call")
      .map((item: any) => item.result);

    // ✅ 4. generatedImage sahi variable se lo
    const generatedImage = imageData[0];

    if (!generatedImage) {
      return NextResponse.json(
        { success: false, error: "Image generation failed" },
        { status: 500 },
      );
    }

    const uploadImageFinalResult = await imagekit.upload({
      file: `data:image/png;base64,${generatedImage}`,
      fileName: `generated-${Date.now()}.jpg`,
      isPublished: true,
    });

    // ✅ 5. updateDoc ke baad NextResponse return karo
    await updateDoc(doc(db, "users-ads", docId), {
      originalImageUrl: originalUpload.url,
      generatedImageUrl: uploadImageFinalResult?.url,
      status: "completed",
      credits: (userInfo?.credits ?? 0) - 5,
      imageToVideoPrompt: json?.imageToVideo,
      prompts: json,
    });

    return NextResponse.json({
      success: true,
      originalImageUrl: originalUpload.url,
      generatedImageUrl: uploadImageFinalResult?.url,
      prompts: json,
      size,
      docId,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || err,
    });
  }
}
