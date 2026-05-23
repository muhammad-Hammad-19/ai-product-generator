// @ts-nocheck
import { imagekit } from "@/lib/imageKit";
import { replicate } from "@/lib/replicate";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();

  const input = {
    image: imageUrl,
    prompt: imageToVideoPrompt,
  };

  await updateDoc(doc(db, "users-ads", docId), {
    imageToVideoStatus: "Panding..",
  });
  const output = await replicate.run("wan-video/wan-2.2-i2v-fast", { input });

  await updateDoc(doc(db, "users-ads", docId), {
    imageToVideoStatus: "completed",
  });

  const res = await fetch(output.url());
  const videoBuffer = Buffer.from(await res.arrayBuffer());

  const uploadResult = await imagekit.upload({
    file: videoBuffer,
    fileName: `video${Date.name()}mp4`,
    isPublished: true,
  });

  await updateDoc(doc(db, "users-ads", docId), {
    imageToVideoStatus: "completed",
    videoUrl: uploadResult.url,
  });
  return NextResponse.json(uploadResult.url());
}
