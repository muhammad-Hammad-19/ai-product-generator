"use client";

import React, { useState } from "react";
import LiveEnginePreview from "../_components/LiveEnginePreview";
import CampaignFormControls from "../_components/CampaignFormControls";

const ProductUpload = ({ title, enableAvater }) => {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

return (
  <div className="w-full min-h-screen bg-neutral-50 dark:bg-zinc-950 p-4">
    {/* Mobile par flex-col (upar-neeche) aur lg (badi screen) par flex-row (left-right) */}
    <div className="w-full md:w-[90%] mx-auto flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Form Section: Mobile par full width, badi screen par half width */}
      <div className="w-full lg:w-1/2">
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
          enableAvater={enableAvater}
        />
      </div>
      
      {/* Preview Section: Mobile par full width, badi screen par half width + sticky */}
      <div className="w-full lg:w-1/2 lg:sticky lg:top-4">
        <LiveEnginePreview />
      </div>

    </div>
  </div>
);
};

export default ProductUpload;
