// import { NextResponse } from "next/server";
// import ImageKit from "imagekit";

// // ImageKit initialization using official SDK on backend
// export const imagekit = new ImageKit({
//   publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
//   urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
// });

// export async function GET() {
//   try {
//     // Generate secure auth parameters
//     const authenticationParameters = imagekit.getAuthenticationParameters();
    
//     // Pure JSON response return karein
//     return NextResponse.json(authenticationParameters);
//   } catch (error) {
//     console.error("ImageKit Auth Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch authentication parameters" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// Build crash se bachne ke liye fallback values set ki hain
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "placeholder_key";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "placeholder_key";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "placeholder_key";

export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

export async function GET() {
  try {
    // Runtime validation: Agar actual keys missing hain toh yahan handle ho jaye
    if (
      publicKey === "placeholder_key" ||
      privateKey === "placeholder_key" ||
      urlEndpoint === "placeholder_key"
    ) {
      console.error("❌ ImageKit env variables are missing in your environment setup!");
      return NextResponse.json(
        { error: "ImageKit environment variables are not configured properly." },
        { status: 500 }
      );
    }

    // Generate secure auth parameters
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    // Pure JSON response return karein
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch authentication parameters" },
      { status: 500 }
    );
  }
}