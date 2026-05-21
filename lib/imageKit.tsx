import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// ImageKit initialization using official SDK on backend
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
  try {
    // Generate secure auth parameters
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    // Pure JSON response return karein
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch authentication parameters" },
      { status: 500 }
    );
  }
}