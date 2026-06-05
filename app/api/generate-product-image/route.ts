// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
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

const PRODUCT_LOCK_PROMPT = `
Create a vibrant product showcase image featuring the uploaded product image in the center, surrounded by dynamic splashes of liquid or relevant material that complements it.

Use a clean, colorful background to make the product stand out.

Include subtle elements, ingredients, or theme-related objects floating around to add context and visual interest.

Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes.

Return ONLY valid JSON in this format:
{
  "textToImage":"",
  "imageToVideo":"",
}

`;

const AVATAR_PROMPT = `
Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way.

The avatar should look friendly and engaging, presenting the product seamlessly for a social media advertisement.

Return ONLY valid JSON in this format:
{
  "textToImage":"",
  "imageToVideo":"",
}
`;

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
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 },
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "User email missing",
        },
        { status: 401 },
      );
    }

    // const q = query(collection(db, "users"), where("email", "==", userEmail));

    // const snapshot = await getDocs(q);

    // if (snapshot.empty) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "User not found",
    //     },
    //     { status: 404 },
    //   );
    // }

    // const userDoc = snapshot.docs[0];
    // const userInfo = userDoc.data();

    // const docId = Date.now().toString();

    // await setDoc(doc(db, "users-ads", docId), {
    //   userEmail,
    //   status: "pending",
    //   size,
    //   createdAt: Date.now(),
    //   avatar,
    // });

    // Upload original image

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes).toString("base64");

    const originalUpload = await imagekit.upload({
      file: buffer,
      fileName: `original-${Date.now()}.jpg`,
      folder: "/campaigns",
    });

    // ==========================
    // GPT PROMPT GENERATION
    // ==========================

    const basePrompt =
      avatar?.length > 2
        ? `${PRODUCT_LOCK_PROMPT}

    ${AVATAR_PROMPT}`
        : PRODUCT_LOCK_PROMPT;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
    ${basePrompt}

    Additional user description:
    ${description}
    `,
            },
            {
              type: "input_image",
              image_url: originalUpload.url,
            },

            ...(avatar?.length > 2
              ? [
                  {
                    type: "input_image",
                    image_url: avatar,
                  },
                ]
              : []),
          ],
        },
      ],
    });

    // const res = await openai.responses.create({
    //   model: "gpt-4.1-mini",
    //   input: "give me text for hammad name , just 1 line",
    // });

    const rawText = response.output_text?.trim() || "";

    const match = rawText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error(`GPT JSON not found. Response: ${rawText}`);
    }

    const prompts = JSON.parse(match[0]);

    if (!prompts?.textToImage) {
      throw new Error("textToImage prompt missing");
    }

    // ==========================
    // IMAGE SIZE MAP
    // ==========================

    let apiSize = "1-1";

    if (size.includes("1536x1024")) {
      apiSize = "16-9";
    }

    if (size.includes("1024x1536")) {
      apiSize = "9-16";
    }

    // ==========================
    // FLUX IMAGE GENERATION
    // ==========================

    const imageRes = await axios.post(
      "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php",
      {
        prompt: prompts.textToImage,
        style_id: 4,
        size: apiSize,
      },
      {
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY!,
          "x-rapidapi-host":
            "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
        },
      },
    );

    const data = imageRes.data;

    const generatedImageUrl =
      data?.final_result?.[0]?.origin ||
      data?.final_result?.[0]?.thumb ||
      data?.image ||
      data?.url;

    if (!generatedImageUrl) {
      throw new Error("Image generation failed");
    }

    // ==========================
    // UPDATE FIRESTORE
    // ==========================

    // await updateDoc(doc(db, "users-ads", docId), {
    //   status: "completed",
    //   originalImageUrl: originalUpload.url,
    //   generatedImageUrl,
    //   imageToVideoPrompt: prompts?.imageToVideo || "",
    //   prompts,
    //   credits: (userInfo?.credits ?? 0) - 5,
    // });

    return NextResponse.json({
      success: true,
      // docId,
      // size,
      // res,
      originalImageUrl: originalUpload.url,
      generatedImageUrl,
      prompts,
      // imageToVideoPrompt: prompts?.imageToVideo,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
