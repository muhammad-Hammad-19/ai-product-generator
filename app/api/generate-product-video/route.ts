// // @ts-nocheck
// import { imagekit } from "@/lib/imageKit";
// import { replicate } from "@/lib/replicate";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();

//     // ✅ Pending status

//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "pending",
//     });

//     // ✅ Dummy video — Replicate comment out (paid hai)
//     const input = { image: imageUrl, prompt: imageToVideoPrompt };

//     // console.log(input, "inputs ======");

//     const output = await replicate.run("wan-video/wan-2.2-i2v-fast", { input });

//     const res = await fetch(output.url());

//     const videoBuffer = Buffer.from(await res.arrayBuffer());

//     const uploadResult = await imagekit.upload({
//       file: videoBuffer,
//       fileName: `video-${Date.now()}.mp4`,
//       isPublished: true,
//     });

//     console.log(uploadResult.url, "updateurl=======");

//     const videoUrl = uploadResult.url || "hello";

//     // const videoUrl =
//     //   "https://youtu.be/2xXwikOCoEg";

//     // ✅ Firestore update
//     if (videoUrl) {
//       await updateDoc(doc(db, "users-ads", docId), {
//         imageToVideoStatus: "completed",
//         videoUrl: videoUrl,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       videoUrl: videoUrl,
//     });
//   } catch (err: any) {
//     console.log("Video generation error:", err?.message);
//     return NextResponse.json(
//       { success: false, error: err?.message || "Something went wrong" },
//       { message: err.message },
//       { status: 500 },
//     );
//   }
// }

// @ts-nocheck

// import { Client } from "@gradio/client";
// import { imagekit } from "@/lib/imageKit";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       imageUrl,
//       imageToVideoPrompt,
//       docId,
//     } = await req.json();

//     // pending status
//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "pending",
//     });

//     // connect HF space
//     const client = await Client.connect(
//       "multimodalart/wan-2-1"
//     );

//     // generate video
//     const result = await client.predict(
//       "/generate_video",
//       {
//         prompt: imageToVideoPrompt,
//         image_input: imageUrl,
//       }
//     );

//     console.log(result, "RESULT");

//     // response structure check
//     const videoPath =
//       result?.data?.[0]?.video ||
//       result?.data?.[0];

//     if (!videoPath) {
//       throw new Error("Video generation failed");
//     }

//     // download generated video
//     const videoResponse = await fetch(videoPath);

//     const videoArrayBuffer =
//       await videoResponse.arrayBuffer();

//     const videoBuffer = Buffer.from(
//       videoArrayBuffer
//     );

//     // upload to imagekit
//     const uploadResult = await imagekit.upload({
//       file: videoBuffer,
//       fileName: `video-${Date.now()}.mp4`,
//       isPublished: true,
//     });

//     const videoUrl = uploadResult.url;

//     // firestore update
//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "completed",
//       videoUrl,
//     });

//     return NextResponse.json({
//       success: true,
//       videoUrl,
//     });
//   } catch (err: any) {
//     console.log(
//       "VIDEO GENERATION ERROR:",
//       err
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           err?.message ||
//           "Something went wrong",
//       },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("image") as File | null;
//     const prompt = (formData.get("prompt") as string) || "";

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "No image provided" },
//         { status: 400 },
//       );
//     }

//     // convert file → base64
//     const bytes = await file.arrayBuffer();
//     const base64Image = Buffer.from(bytes).toString("base64");

//     // start video generation
//     let operation = await ai.models.generateVideos({
//       model: "veo-3.1-generate-preview",
//       prompt,
//       image: {
//         imageBytes: base64Image,
//         mimeType: file.type,
//       },
//       config: {
//         aspectRatio: "16:9",
//       },
//     });

//     // polling
//     while (!operation.done) {
//       await new Promise((r) => setTimeout(r, 10000));

//       operation = await ai.operations.getVideosOperation({
//         operation,
//       });
//     }

//     const video = operation.response.generatedVideos?.[0];

//     if (!video) {
//       return NextResponse.json({
//         success: false,
//         error: "No video generated",
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       videoUrl: video.video,
//     });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Video generation failed" },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, prompt } = body;
    console.log(imageUrl, "imageUrl", prompt, "Promt");

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { success: false, error: "Missing imageUrl or prompt" },
        { status: 400 },
      );
    }
  
    
    const response = await axios.post(
      "https://udayogra-images-to-video-v1.p.rapidapi.com/am",
      {
        image_url: imageUrl, // 👈 CHANGE THIS
        prompt: prompt,
      },
      {
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY || "",
          "x-rapidapi-host": "udayogra-images-to-video-v1.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        params: {
          state: "videoapi",
        },
      },
    );

    return NextResponse.json({
      success: true,
      data: response,
      imageUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("API ERROR:", err?.response?.data || err.message);

    return NextResponse.json(
      {
        success: false,
        error: err?.response?.data || err.message,
      },
      { status: 500 },
    );
  }
}
