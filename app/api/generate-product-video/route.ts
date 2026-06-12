// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl, prompt, docId } = await req.json();
//     const videoUrl =
//       "https://pixabay.com/videos/download/video-272382_medium.mp4";

//     if (!imageUrl || !prompt || !docId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "imageUrl, prompt, docId required",
//         },
//         { status: 400 },
//       );
//     }

//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "pending",
//     });

//     // const res = await fetch(imageUrl);
//     // const buffer = await res.arrayBuffer();
//     // const base64Image = Buffer.from(buffer).toString("base64");

//     // let operation = await ai.models.generateVideos({
//     //   model: "veo-3.1-generate-preview",
//     //   prompt,

//     //   image: {
//     //     imageBytes: base64Image, // ✅ FIXED
//     //     mimeType: "image/jpeg",
//     //   },

//     //   config: {
//     //     aspectRatio: "16:9",
//     //   },
//     // });

//     // // 🔄 polling
//     // while (!operation.done) {
//     //   await new Promise((r) => setTimeout(r, 10000));

//     //   operation = await ai.operations.getVideosOperation({
//     //     operation,
//     //   });
//     // }

//     // const video = operation?.response?.generatedVideos?.[0];

//     // if (!video?.video) {
//     //   await updateDoc(doc(db, "users-ads", docId), {
//     //     imageToVideoStatus: "failed",
//     //   });

//     //   return NextResponse.json({
//     //     success: false,
//     //     error: "No video generated",
//     //   });
//     // }

//     // const videoUrl = video.video;

//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "completed",
//       videoUrl,
//     });

//     return NextResponse.json({
//       success: true,
//       videoUrl,
//       docId,
//     });
//   } catch (err: any) {
//     console.error("VIDEO ERROR:", err);

//     return NextResponse.json(
//       {
//         success: false,
//         error: err.message || "Video generation failed",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY!;
const BASE_URL = "https://api.wavespeed.ai/api/v3";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, docId } = await req.json();

    if (!imageUrl || !prompt || !docId) {
      return NextResponse.json(
        { success: false, error: "imageUrl, prompt, docId required" },
        { status: 400 },
      );
    }

    await updateDoc(doc(db, "users-ads", docId), {
      imageToVideoStatus: "pending",
    });

    console.log("=== WaveSpeed: Seedance 2.0 start ===");

    // Step 1 — Submit — Bearer token header
    // Step 1 — Submit
    const generateRes = await axios.post(
      "https://api.wavespeed.ai/api/v3/bytedance/seedance-2.0-fast/image-to-video",
      {
        image: imageUrl,
        prompt: prompt,
        duration: 5,
        resolution: "720p",
        generate_audio: false,
        enable_web_search: false,
      },
      {
        headers: {
          Authorization: `Bearer ${WAVESPEED_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const predictionId = generateRes.data?.data?.id;
    console.log("Prediction ID:", predictionId);
    console.log("Full response:", JSON.stringify(generateRes.data, null, 2));

    // Step 2 — Polling — /result add kiya ✅

    // Step 2 — Polling
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 10000));

      const statusRes = await axios.get(
        `https://api.wavespeed.ai/api/v3/predictions/${predictionId}/result`, // ← /result
        {
          headers: {
            Authorization: `Bearer ${WAVESPEED_API_KEY}`,
          },
        },
      );

      const status = statusRes.data?.data?.status;

      const outputs = statusRes.data?.data?.outputs;

      console.log(`Attempt ${attempts + 1} — status: ${status}`);

      if (status === "completed" && outputs?.[0]) {
        videoUrl = outputs[0];
        break;
      }

      if (status === "failed") {
        console.error("Failed:", statusRes.data);
        break;
      }

      attempts++;
    }

    if (!videoUrl) {
      return NextResponse.json({
        success: false,
        error: "Video nahi bani",
      });
    }
    
    await updateDoc(doc(db, "users-ads", docId), {
      imageToVideoStatus: "completed",
      videoUrl,
    });

    return NextResponse.json({ success: true, videoUrl, docId });
  } catch (err: any) {
    console.error("ERROR:", err.message);
    console.error("Detail:", JSON.stringify(err.response?.data, null, 2));
    return NextResponse.json(
      { success: false, error: err.message, detail: err.response?.data },
      { status: 500 },
    );
  }
}
