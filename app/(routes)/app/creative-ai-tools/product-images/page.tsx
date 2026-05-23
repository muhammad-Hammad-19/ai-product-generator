"use client";

import React, { useState } from "react";
import LiveEnginePreview from "../_components/LiveEnginePreview";
import CampaignFormControls from "../_components/CampaignFormControls";

const ProductUpload = ({ title }) => {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-zinc-950 p-4">
      <div className="w-[90%] mx-auto flex gap-6 items-start">
        <div className="w-1/2">
          <CampaignFormControls
            description={description}
            setDescription={setDescription}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            uploading={uploading}
            setUploading={setUploading}
            uploadSuccess={uploadSuccess}
            setUploadSuccess={setUploadSuccess}
            title={title}
          />
        </div>

        <div className="w-1/2 sticky top-4">
          <LiveEnginePreview />
        </div>
      </div>
    </div>
  );
};

export default ProductUpload;
