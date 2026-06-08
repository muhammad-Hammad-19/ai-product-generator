import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, docId } = await req.json();
    const videoUrl =
      "https://pixabay.com/videos/download/video-272382_medium.mp4";

    if (!imageUrl || !prompt || !docId) {
      return NextResponse.json(
        {
          success: false,
          error: "imageUrl, prompt, docId required",
        },
        { status: 400 },
      );
    }

    await updateDoc(doc(db, "users-ads", docId), {
      imageToVideoStatus: "pending",
    });
    
    // const res = await fetch(imageUrl);
    // const buffer = await res.arrayBuffer();
    // const base64Image = Buffer.from(buffer).toString("base64");

    // let operation = await ai.models.generateVideos({
    //   model: "veo-3.1-generate-preview",
    //   prompt,

    //   image: {
    //     imageBytes: base64Image, // ✅ FIXED
    //     mimeType: "image/jpeg",
    //   },

    //   config: {
    //     aspectRatio: "16:9",
    //   },
    // });

    // // 🔄 polling
    // while (!operation.done) {
    //   await new Promise((r) => setTimeout(r, 10000));

    //   operation = await ai.operations.getVideosOperation({
    //     operation,
    //   });
    // }

    // const video = operation?.response?.generatedVideos?.[0];

    // if (!video?.video) {
    //   await updateDoc(doc(db, "users-ads", docId), {
    //     imageToVideoStatus: "failed",
    //   });

    //   return NextResponse.json({
    //     success: false,
    //     error: "No video generated",
    //   });
    // }

    // const videoUrl = video.video;

    await updateDoc(doc(db, "users-ads", docId), {
      imageToVideoStatus: "completed",
      videoUrl,
    });

    return NextResponse.json({
      success: true,
      videoUrl,
      docId,
    });
  } catch (err: any) {
    console.error("VIDEO ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Video generation failed",
      },
      { status: 500 },
    );
  }
}
