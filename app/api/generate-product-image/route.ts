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
import { text } from "stream/consumers";

const PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;
const AVATAR_PROMT = `Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way. The avatar should look friendly and engaging, presenting the product seamlessly for a social media ad.`;
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

    // ✅ email field se match karo
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const snapshot = await getDocs(q);

    // ✅ check karo user mila ya nahi
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userDoc = snapshot.docs[0];
    const userInfo = userDoc.data();

    // ✅ doc() bracket fix
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

    // const finalPrompt = description
    //   ? `${PROMPT}\n\nExtra context: ${description}`
    //   : PROMPT;

    // Text generate for Image generation

    // const response = await openai.responses.create({
    //   model: "gpt-4.1-mini",
    //   input: [
    //     {
    //       role: "user",
    //       content: [
    //         {
    //           type: "input_text",
    //           text: avatar?.length > 2 ? AVATAR_PROMT : finalPrompt,
    //         },
    //         { type: "input_image", image_url: originalUpload.url },
    //       ],
    //     },
    //   ],
    // });

    // const text = response.output_text.trim();

    // // JSON block extract karo { } ke beech se
    // const match = text.match(/\{[\s\S]*\}/);
    // if (!match) {
    //   throw new Error("No JSON found in GPT response: " + text);
    // }
    // let json = JSON.parse(match[0]);

    // Image generate feature

    // const image_generate_res = await openai.responses.create({
    //   model: "gpt-4.1-mini",
    //   input: [
    //     {
    //       role: "user",
    //       content: [
    //         {
    //           type: "input_text",
    //           text: `${json?.textToImage}. Image size: ${size}`,
    //         },
    //         { type: "input_image", image_url: originalUpload.url },
    //         ...(avatar?.length > 2
    //           ? [{ text: "input_image", image_url: avatar }]
    //           : []),
    //       ],
    //     },
    //   ],
    //   tools: [{ type: "image_generation" }],
    // });

    // const imageData = image_generate_res.output
    //   .filter((item: any) => item.type === "image_generation_call")
    //   .map((item: any) => item.result);

    // const generatedImage = imageData[0];

    // if (!generatedImage) {
    //   return NextResponse.json(
    //     { success: false, error: "Image generation failed" },
    //     { status: 500 },
    //   );
    // }

    // // Save ImageKit
    // const uploadImageFinalResult = await imagekit.upload({
    //   file: `data:image/png;base64,${generatedImage}`,
    //   fileName: `generated-${Date.now()}.jpg`,
    //   isPublished: true,
    // });

    // Save db

    await updateDoc(doc(db, "users-ads", docId), {
      originalImageUrl: originalUpload.url,
      // generatedImageUrl: uploadImageFinalResult?.url,
      status: "completed",
      credits: (userInfo?.credits ?? 0) - 5,
      // imageToVideoPrompt: json?.imageToVideo,
      prompts: /*json*/ PROMPT || description,
    });

    return NextResponse.json({
      success: true,
      originalImageUrl: originalUpload.url,
      // generatedImageUrl: uploadImageFinalResult?.url,
      // prompts: json,
      size,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || err,
    });
  }
}
