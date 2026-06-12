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
You are a professional product photography AI.

The user has provided a product image and optionally a custom prompt.
The user may write their prompt in English OR Roman Urdu (e.g. "joote ka acha photo banao") — understand both and respond accordingly.

Your task:
1. Analyze the uploaded product image to identify what the product is (e.g. perfume, food, drink, electronics, skincare, shoes, etc.)
2. If the user has provided a custom prompt (in English or Roman Urdu), follow it closely while keeping the product as the focal point.
3. If NO custom prompt is provided, generate a fitting cinematic product showcase based on the product type:
   - Beverages/drinks → liquid splashes, ice, bubbles
   - Food → fresh ingredients, steam, crumbs, spices floating
   - Perfume/cosmetics → soft bokeh, petals, silk fabric, light diffusion
   - Electronics/gadgets → clean dark/gradient background, subtle glows, geometric lines
   - Skincare → clean white/pastel background, water droplets, botanicals
   - Shoes/fashion → studio lighting, clean background, dramatic shadows
   - Other products → clean studio-style background with complementary props

Roman Urdu prompt examples you should understand:
- "joote ko pahadon pe dikhao" → show shoes on mountain setting
- "perfume ke saath phool ho" → perfume with flowers around it
- "dark background pe rakho" → place product on dark background
- "luxury feel chahiye" → luxury aesthetic
- "simple rakho" → keep it minimal and clean

Always:
- Keep the product SHARP and centered
- Match the visual style to the product category
- Make it look like a high-end commercial advertisement
- The output JSON values must always be in English (for image generation)

Return ONLY valid JSON in this format (no extra text, no markdown):
{
  "textToImage": "<detailed image generation prompt in English>",
  "imageToVideo": "<short motion description in English>"
}
`;

const AVATAR_PROMPT = `
You are a professional AI advertisement director.

The user has provided:
1. An avatar/model image
2. A product image
3. Optionally a custom prompt in English OR Roman Urdu

The user may write their prompt in English OR Roman Urdu (e.g. "avatar ke saath joote dikhao pahadon pe") — understand both languages and respond accordingly.

Your task:
1. Analyze the product to understand its category (e.g. skincare, food, electronics, fashion, perfume, etc.)
2. Analyze the avatar's appearance (gender, style, age group) to match them naturally with the product.
3. If the user has provided a custom prompt (in English or Roman Urdu), follow it closely while keeping both the avatar and product prominent.
4. If NO custom prompt is provided, generate a fitting scene based on product type:
   - Skincare/Beauty → avatar applying or holding product, soft studio lighting, clean pastel background
   - Food/Beverage → avatar enjoying or presenting the product, bright kitchen or cafe setting
   - Perfume/Fragrance → avatar holding bottle elegantly, bokeh background, luxury feel
   - Electronics/Gadgets → avatar using the product naturally, modern minimal background
   - Fashion/Shoes → avatar wearing or showcasing item, lifestyle or studio setting
   - Fitness/Health → avatar in activewear, gym or outdoor setting
   - Other → avatar standing next to product in a clean, well-lit studio setting

Roman Urdu prompt examples you should understand:
- "avatar joote pehne aur pahadon pe khara ho" → avatar wearing shoes standing on mountains
- "luxury feel chahiye background mein" → luxury background aesthetic
- "avatar product haath mein pakde" → avatar holding product in hand
- "office setting mein rakho" → place in office setting
- "bahar ka scene ho" → outdoor scene
- "simple aur clean rakho" → minimal clean setting
- "avatar camera ki taraf dekhe" → avatar looking toward camera

Always:
- Avatar should look NATURAL and engaged with the product (not stiff or floating)
- Product must be CLEARLY VISIBLE and in focus
- Scene should feel like a real social media advertisement
- Lighting should be consistent between avatar and product
- Expression should match the product vibe (energetic, calm, luxurious, fun)
- The output JSON values must always be in English (for image generation)

Return ONLY valid JSON in this format (no extra text, no markdown):
{
  "textToImage": "<detailed scene prompt in English>",
  "imageToVideo": "<short motion description in English>"
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

    const q = query(collection(db, "users"), where("email", "==", userEmail));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const userDoc = snapshot.docs[0];
    const userInfo = userDoc.data();

    const docId = Date.now().toString();

    await setDoc(doc(db, "users-ads", docId), {
      userEmail,
      status: "pending",
      size,
      createdAt: Date.now(),
      avatar,
    });

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

    await updateDoc(doc(db, "users-ads", docId), {
      status: "completed",
      originalImageUrl: originalUpload.url,
      generatedImageUrl,
      imageToVideoPrompt: prompts?.imageToVideo || "",
      prompts,
      credits: (userInfo?.credits ?? 0) - 5,
    });

    return NextResponse.json({
      success: true,
      docId,
      size,

      originalImageUrl: originalUpload.url,
      generatedImageUrl,
      prompts,
      imageToVideoPrompt: prompts?.imageToVideo,
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
