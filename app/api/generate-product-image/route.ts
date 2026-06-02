// // @ts-nocheck
// import { NextRequest, NextResponse } from "next/server";
// import { imagekit } from "@/lib/imageKit";
// import { openai } from "@/lib/openai";
// import {
//   collection,
//   doc,
//   getDocs,
//   query,
//   setDoc,
//   updateDoc,
//   where,
// } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";

// const PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;
// const AVATAR_PROMPT = `Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way. The avatar should look friendly and engaging, presenting the product seamlessly for a social media ad. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File | null;
//     const size = (formData.get("size") as string) || "1024x1024";
//     const description = (formData.get("description") as string) || "";
//     const userEmail = (formData.get("userEmail") as string) || "";
//     const avatar = (formData.get("avatar") as string) || "";

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "No file uploaded" },
//         { status: 400 },
//       );
//     }

//     if (!userEmail) {
//       return NextResponse.json(
//         { success: false, error: "User not logged in" },
//         { status: 401 },
//       );
//     }

//     const q = query(collection(db, "users"), where("email", "==", userEmail));
//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       return NextResponse.json(
//         { success: false, error: "User not found" },
//         { status: 404 },
//       );
//     }

//     const userDoc = snapshot.docs[0];
//     const userInfo = userDoc.data();

//     const docId = Date.now().toString();

//     await setDoc(doc(db, "users-ads", docId), {
//       userEmail: userEmail,
//       status: "pending",
//       size,
//     });

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes).toString("base64");

//     const originalUpload = await imagekit.upload({
//       file: buffer,
//       fileName: `original-${Date.now()}.jpg`,
//       folder: "/campaigns",
//     });

//     const finalPrompt = description
//       ? `${PROMPT}\n\nExtra context: ${description}`
//       : PROMPT;

//     // ✅ 1. stream/consumers import hataya — response.output_text use karo
//     const response = await openai.responses.create({
//       model: "gpt-4o-mini",
//       input: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "input_text",
//               text: avatar?.length > 2 ? AVATAR_PROMPT : finalPrompt,
//             },
//             { type: "input_image", image_url: originalUpload.url },
//           ],
//         },
//       ],
//     });

//     // ✅ 2. text variable sahi se banao
//     const rawText = response.output_text.trim();
//     const match = rawText.match(/\{[\s\S]*\}/);

//     if (!match) {
//       throw new Error("No JSON found in GPT response: " + rawText);
//     }

//     let json = JSON.parse(match[0]);

//     // Image generate
//     const image_generate_res = await openai.responses.create({
//       model: "gpt-4o-mini",
//       input: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "input_text",
//               text: `${json?.textToImage}. Image size: ${size}`,
//             },
//             { type: "input_image", image_url: originalUpload.url },
//             // ✅ 3. avatar image type fix
//             ...(avatar?.length > 2
//               ? [{ type: "input_image", image_url: avatar }]
//               : []),
//           ],
//         },
//       ],
//       tools: [{ type: "image_generation" }],
//     });

//     const imageData = image_generate_res.output
//       .filter((item: any) => item.type === "image_generation_call")
//       .map((item: any) => item.result);

//     // ✅ 4. generatedImage sahi variable se lo
//     const generatedImage = imageData[0];

//     if (!generatedImage) {
//       return NextResponse.json(
//         { success: false, error: "Image generation failed" },
//         { status: 500 },
//       );
//     }

//     const uploadImageFinalResult = await imagekit.upload({
//       file: `data:image/png;base64,${generatedImage}`,
//       fileName: `generated-${Date.now()}.jpg`,
//       isPublished: true,
//     });

//     // ✅ 5. updateDoc ke baad NextResponse return karo

//     await updateDoc(doc(db, "users-ads", docId), {
//       originalImageUrl: originalUpload.url,
//       generatedImageUrl: uploadImageFinalResult?.url,
//       status: "completed",
//       credits: (userInfo?.credits ?? 0) - 5,
//       imageToVideoPrompt: json?.imageToVideo,
//       prompts: json,
//     });

//     return NextResponse.json({
//       success: true,
//       originalImageUrl: originalUpload.url,
//       generatedImageUrl: uploadImageFinalResult?.url,
//       prompts: json,
//       size,
//       docId,
//     });
//   } catch (err: any) {
//     return NextResponse.json({
//       success: false,
//       error: err?.message || err,
//     });
//   }
// }

// @ts-nocheck

// import { NextRequest, NextResponse } from "next/server";
// import { imagekit } from "@/lib/imageKit";
// import { GoogleGenAI } from "@google/genai";

// import {
//   collection,
//   doc,
//   getDocs,
//   query,
//   setDoc,
//   updateDoc,
//   where,
// } from "firebase/firestore";

// import { db } from "@/configs/firebaseConfig";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// const PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

// const AVATAR_PROMPT = `Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way. The avatar should look friendly and engaging, presenting the product seamlessly for a social media ad. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File | null;

//     const size = (formData.get("size") as string) || "1024x1024";

//     const description = (formData.get("description") as string) || "";

//     const userEmail = (formData.get("userEmail") as string) || "";

//     const avatar = (formData.get("avatar") as string) || "";

//     // =========================
//     // VALIDATION
//     // =========================
//     if (!file) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "No file uploaded",
//         },
//         { status: 400 },
//       );
//     }

//     if (!userEmail) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User not logged in",
//         },
//         { status: 401 },
//       );
//     }

//     // =========================
//     // FIND USER
//     // =========================
//     const q = query(collection(db, "users"), where("email", "==", userEmail));

//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User not found",
//         },
//         { status: 404 },
//       );
//     }

//     const userDoc = snapshot.docs[0];
//     const userInfo = userDoc.data();

//     // =========================
//     // CREATE DOC
//     // =========================
//     const docId = Date.now().toString();

//     await setDoc(doc(db, "users-ads", docId), {
//       userEmail,
//       status: "pending",
//       size,
//     });

//     // =========================
//     // IMAGE TO BASE64
//     // =========================
//     const bytes = await file.arrayBuffer();

//     const buffer = Buffer.from(bytes);

//     const base64Image = buffer.toString("base64");

//     // =========================
//     // UPLOAD ORIGINAL IMAGE
//     // =========================
//     const originalUpload = await imagekit.upload({
//       file: base64Image,
//       fileName: `original-${Date.now()}.jpg`,
//       folder: "/campaigns",
//     });

//     // =========================
//     // FINAL PROMPT
//     // =========================
//     const finalPrompt = description
//       ? `${PROMPT}\n\nExtra context: ${description}`
//       : PROMPT;

//     // =========================
//     // GEMINI PROMPT GENERATION
//     // =========================
//     const promptResponse = await ai.models.generateContent({
//       model: "gemini-2.5-flash",

//       contents: [
//         {
//           role: "user",

//           parts: [
//             {
//               text: avatar?.length > 2 ? AVATAR_PROMPT : finalPrompt,
//             },

//             {
//               inlineData: {
//                 mimeType: file.type,
//                 data: base64Image,
//               },
//             },
//           ],
//         },
//       ],
//     });

//     const rawText = promptResponse.text;

//     const match = rawText.match(/\{[\s\S]*\}/);

//     if (!match) {
//       throw new Error("No JSON found in Gemini response");
//     }

//     const json = JSON.parse(match[0]);

//     // =========================
//     // IMAGE GENERATION
//     // =========================
//     const imageResponse = await ai.models.generateContent({
//       model: "gemini-2.5-flash-image",

//       contents: [
//         {
//           role: "user",

//           parts: [
//             {
//               text: `${json?.textToImage}. Image size: ${size}`,
//             },

//             {
//               inlineData: {
//                 mimeType: file.type,
//                 data: base64Image,
//               },
//             },
//           ],
//         },
//       ],
//     });

//     // =========================
//     // GET GENERATED IMAGE
//     // =========================
//     const parts = imageResponse.candidates?.[0]?.content?.parts || [];

//     const imagePart = parts.find((part: any) => part.inlineData);

//     if (!imagePart) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Image generation failed",
//         },
//         { status: 500 },
//       );
//     }

//     const generatedImage = imagePart.inlineData.data;

//     // =========================
//     // UPLOAD GENERATED IMAGE
//     // =========================
//     const uploadImageFinalResult = await imagekit.upload({
//       file: generatedImage,
//       fileName: `generated-${Date.now()}.png`,
//       isPublished: true,
//     });

//     // =========================
//     // UPDATE FIREBASE
//     // =========================
//     await updateDoc(doc(db, "users-ads", docId), {
//       originalImageUrl: originalUpload.url,

//       generatedImageUrl: uploadImageFinalResult?.url,

//       status: "completed",

//       credits: (userInfo?.credits ?? 0) - 5,

//       imageToVideoPrompt: json?.imageToVideo,

//       prompts: json,
//     });

//     // =========================
//     // FINAL RESPONSE
//     // =========================
//     return NextResponse.json({
//       success: true,

//       originalImageUrl: originalUpload.url,

//       generatedImageUrl: uploadImageFinalResult?.url,

//       prompts: json,

//       size,

//       docId,
//     });
//   } catch (err: any) {
//     console.error(err);

//     return NextResponse.json({
//       success: false,
//       error: err?.message || err,
//     });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
// import { imagekit } from "@/lib/imageKit";
// import {
//   collection,
//   doc,
//   getDocs,
//   query,
//   setDoc,
//   updateDoc,
//   where,
// } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";
// const PRODUCT_LOCK_PROMPT = `Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complements. Use a clean, colorful background to make the product stand out. Include subtle elements, ingredients, or theme floating around to add context and visual interest. Ensure the product is sharp and in focus, with motion and energy conveyed through the splashes. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;
// const avatarPrompt = `Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way. The avatar should look friendly and engaging, presenting the product seamlessly for a social media ad. Also give me image to video prompt for same in JSON format: {"textToImage":"","imageToVideo":""}`;

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File | null;
//     const size = (formData.get("size") as string) || "1024x1024";
//     const description = (formData.get("description") as string) || "";
//     const userEmail = (formData.get("userEmail") as string) || "";
//     const avatar = (formData.get("avatar") as string) || "";

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "No file" },
//         { status: 400 },
//       );
//     }

//     const q = query(collection(db, "users"), where("email", "==", userEmail));
//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       return NextResponse.json(
//         { success: false, error: "User not found" },
//         { status: 404 },
//       );
//     }

//     const docId = Date.now().toString();

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes).toString("base64");

//     const uploaded = await imagekit.upload({
//       file: buffer,
//       fileName: `img-${Date.now()}.jpg`,
//       folder: "/campaigns",
//     });

//     const finalPrompt = `
// ${PRODUCT_LOCK_PROMPT}

// ${description}

// ${avatarPrompt}
// `;

//     let apiSize = "1-1";
//     if (size.includes("1536x1024")) apiSize = "16-9";
//     if (size.includes("1024x1536")) apiSize = "9-16";

//     const response = await openai.responses.create({
//       model: "gpt-4o-mini",
//       input: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "input_text",
//               text: avatar?.length > 2 ? AVATAR_PROMPT : finalPrompt,
//             },
//             { type: "input_image", image_url: originalUpload.url },
//           ],
//         },
//       ],
//     });

//     const res = await axios.post(
//       "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php",
//       {
//         prompt: finalPrompt,
//         style_id: 4,
//         size: apiSize,
//       },
//       {
//         headers: {
//           "x-rapidapi-key": process.env.RAPID_API_KEY!,
//           "x-rapidapi-host":
//             "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
//         },
//       },
//     );

//     const data = res.data;

//     const image =
//       data?.final_result?.[0]?.origin ||
//       data?.final_result?.[0]?.thumb ||
//       data?.image ||
//       data?.url;

//     if (!image) {
//       return NextResponse.json(
//         { success: false, error: "No image generated" },
//         { status: 500 },
//       );
//     }

//     await setDoc(doc(db, "users-ads", docId), {
//       userEmail,
//       createdAt: Date.now(),
//       status: "completed",
//       originalImageUrl: uploaded.url,
//       generatedImageUrl: image,
//       avatar,
//     });

//     return NextResponse.json({
//       success: true,
//       generatedImageUrl: image,
//       originalImageUrl: uploaded.url,
//       avatar,
//       docId,
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, error: err?.message || "Server error" },
//       { status: 500 },
//     );
//   }
// }

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
  "imageToVideo":""
}
`;

const AVATAR_PROMPT = `
Place this avatar model wearing professional or casual outfit, standing or sitting next to the product in a realistic and natural way.

The avatar should look friendly and engaging, presenting the product seamlessly for a social media advertisement.

Return ONLY valid JSON in this format:
{
  "textToImage":"",
  "imageToVideo":""
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
//     // ==========================
//     const basePrompt =
//       avatar?.length > 2
//         ? `${PRODUCT_LOCK_PROMPT}

// ${AVATAR_PROMPT}`
//         : PRODUCT_LOCK_PROMPT;

//     const response = await openai.responses.create({
//       model: "gpt-4.1-mini",
//       input: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "input_text",
//               text: `
// ${basePrompt}

// Additional user description:
// ${description}
// `,
//             },
//             {
//               type: "input_image",
//               image_url: originalUpload.url,
//             },

//             ...(avatar?.length > 2
//               ? [
//                   {
//                     type: "input_image",
//                     image_url: avatar,
//                   },
//                 ]
//               : []),
//           ],
//         },
//       ],
//     });

//     const rawText = response.output_text?.trim() || "";

//     const match = rawText.match(/\{[\s\S]*\}/);

    // if (!match) {
    //   throw new Error(`GPT JSON not found. Response: ${rawText}`);
    // }

    // const prompts = JSON.parse(match[0]);

    // if (!prompts?.textToImage) {
    //   throw new Error("textToImage prompt missing");
    // }

    // ==========================
    // IMAGE SIZE MAP
    // ==========================

    // let apiSize = "1-1";

    // if (size.includes("1536x1024")) {
    //   apiSize = "16-9";
    // }

    // if (size.includes("1024x1536")) {
    //   apiSize = "9-16";
    // }

    // ==========================
    // FLUX IMAGE GENERATION
    // ==========================

    // const imageRes = await axios.post(
    //   "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php",
    //   {
    //     prompt: prompts.textToImage,
    //     style_id: 4,
    //     size: apiSize,
    //   },
    //   {
    //     headers: {
    //       "x-rapidapi-key": process.env.RAPID_API_KEY!,
    //       "x-rapidapi-host":
    //         "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
    //     },
    //   },
    // );

    // const data = imageRes.data;

    // const generatedImageUrl =
    //   data?.final_result?.[0]?.origin ||
    //   data?.final_result?.[0]?.thumb ||
    //   data?.image ||
    //   data?.url;

    // if (!generatedImageUrl) {
    //   throw new Error("Image generation failed");
    // }

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
      originalImageUrl: originalUpload.url,
      // generatedImageUrl,
      // prompts,
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
