"use client";

import React, { useState } from "react";
import { ImageKitProvider } from "imagekitio-next";
import LiveEnginePreview from "../_components/LiveEnginePreview";
import CampaignFormControls from "../_components/CampaignFormControls";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

const authenticator = async () => {
  try {
    const response = await fetch("/lib/imagekit-auth");
    if (!response.ok) throw new Error("Failed validation parameters fetch");
    return await response.json();
  } catch (error: any) {
    throw new Error(`Authentication token error: ${error.message}`);
  }
};

const ProductUpload = () => {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="w-full min-h-screen bg-neutral-50/50 dark:bg-zinc-950 p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL MODULE */}
          <div className="lg:col-span-7">
            <CampaignFormControls
              description={description}
              setDescription={setDescription}
              selectedImage={selectedImage} // Yeh missing tha, add kar diya
              setSelectedImage={setSelectedImage}
              uploading={uploading}
              setUploading={setUploading}
              uploadSuccess={uploadSuccess}
              setUploadSuccess={setUploadSuccess}
            />
          </div>

          {/* RIGHT PANEL PREVIEW MONITOR */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <LiveEnginePreview
              selectedImage={selectedImage}
              description={description}
            />
          </div>
        </div>
      </div>
    </ImageKitProvider>
  );
};

export default ProductUpload;