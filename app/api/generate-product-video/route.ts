// // @ts-nocheck
// import { imagekit } from "@/lib/imageKit";
// import { replicate } from "@/lib/replicate";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();

//     const input = {
//       image: imageUrl,
//       prompt: imageToVideoPrompt,
//     };

//     // ✅ 1. "Panding" → "pending"
//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "pending",
//     });

//     const output = await replicate.run("wan-video/wan-2.2-i2v-fast", { input });

//     const res = await fetch(output.url());
//     const videoBuffer = Buffer.from(await res.arrayBuffer());

//     // ✅ 2. Date.name() → Date.now()
//     const uploadResult = await imagekit.upload({
//       file: videoBuffer,
//       fileName: `video-${Date.now()}.mp4`,
//       isPublished: true,
//     });

//     // ✅ 3. Ek baar updateDoc — duplicate hataya
//     await updateDoc(doc(db, "users-ads", docId), {
//       imageToVideoStatus: "completed",
//       videoUrl: uploadResult.url,
//     });
//     const dummyVideoUrl =
//       "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
//     // ✅ 4. uploadResult.url string hai — .url() nahi, .url
//     return NextResponse.json({
//       success: true,
//       videoUrl: uploadResult.url,
//       dummyVideoUrl,
//     });
//   } catch (err: any) {
//     console.log("Error details:", err.response?.data); // ✅ actual server error
//     alert("Video generation failed");
//   }
// }

//  that is dummy all
// @ts-nocheck
import { imagekit } from "@/lib/imageKit";
import { replicate } from "@/lib/replicate";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();

    // ✅ Pending status

    // await updateDoc(doc(db, "users-ads", docId), {
    //   imageToVideoStatus: "pending",
    // });

    // ✅ Dummy video — Replicate comment out (paid hai)
    const input = { image: imageUrl, prompt: imageToVideoPrompt };

    console.log(input, "inputs ======");

    const output = await replicate.run("wan-video/wan-2.2-i2v-fast", { input });
    const res = await fetch(output.url());
    const videoBuffer = Buffer.from(await res.arrayBuffer());


    const uploadResult = await imagekit.upload({
      file: videoBuffer,
      fileName: `video-${Date.now()}.mp4`,
      isPublished: true,
    });
    console.log(uploadResult.url, "updateurl=======");

    const videoUrl = uploadResult.url || "hello";

    // const videoUrl =
    //   "https://youtu.be/2xXwikOCoEg";

    // ✅ Firestore update
    if (videoUrl) {
      await updateDoc(doc(db, "users-ads", docId), {
        imageToVideoStatus: "completed",
        videoUrl: videoUrl,
      });
    }

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
    });
  } catch (err: any) {
    console.log("Video generation error:", err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
