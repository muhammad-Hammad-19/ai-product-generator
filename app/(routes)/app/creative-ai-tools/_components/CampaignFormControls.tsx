"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Sparkles,
  UploadCloud,
  Wand2,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

interface FormProps {
  description: string;
  setDescription: (val: string) => void;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
  uploading: boolean;
  setUploading: (val: boolean) => void;
  uploadSuccess: boolean;
  setUploadSuccess: (val: boolean) => void;
}

export default function CampaignFormControls({
  description,
  setDescription,
  selectedImage,
  setSelectedImage,
  uploading,
  setUploading,
  uploadSuccess,
  setUploadSuccess,
}: FormProps) {
  const [isDummySelected, setIsDummySelected] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null); // Actual binary file track karne ke liye state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dummyPhotos = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      tag: "Minimalist Watch",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      tag: "Sport Sneakers",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      tag: "Wireless Headset",
    },
  ];

  // 1. File select hone par sirf preview set hoga, API hit nahi hogi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit validation check
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large! Max limit is 5MB.");
      return;
    }

    setLocalFile(file);
    setIsDummySelected(false);
    setUploadSuccess(false);

    // Frontend par image preview dikhane ke liye URL create kiya
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
  };

  // 2. Button click hone par actual upload aur AI image generation start hogi
  const handleGenerateStrategy = async () => {
    // Validation: Agar na local file selected hai aur na hi koi dummy catalog image
    if (!localFile && !isDummySelected) {
      alert("Please select or upload a product image first!");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("description", description);

    if (isDummySelected && selectedImage) {
      // Agar dummy catalog photo select ki hai toh direct uska URL string bhejenge
      formData.append("catalogUrl", selectedImage);
    } else if (localFile) {
      // Agar local image select ki hai toh pure binary file bhejenge
      formData.append("file", localFile);
    }

    try {
      console.log("Triggering AI Generator Pipeline...");
      const response = await axios.post("/api/generate-product-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("AI Generation Response:", response.data);

      if (response.data.success) {
        setUploadSuccess(true);
        // Backend jo Gemini se generated aiImageUrl (base64 string) bhejega, use state me set kiya
        setSelectedImage(response.data.aiImageUrl); 
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error.response?.data || error.message);
      alert("Generation failed! Check server logs.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);
    setLocalFile(null);
    setUploadSuccess(false);
    setIsDummySelected(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
      {/* Header Context */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Campaign Studio
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Configure parameters, generate automated product listings, and launch ads.
        </p>
      </div>

      <hr className="border-neutral-100 dark:border-zinc-800" />

      {/* SECTION 1: Main Upload Container */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
          Upload Original Product Asset via Cloud
        </h2>

        <div
          onClick={() => !selectedImage && !uploading && fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-zinc-800 rounded-xl p-6 bg-neutral-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900/80 transition-all group min-h-[180px] overflow-hidden"
        >
          {selectedImage ? (
            <div className="absolute inset-0 w-full h-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Product asset"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm border border-neutral-200 dark:border-zinc-700 text-neutral-800 dark:text-neutral-200">
                {uploadSuccess ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    AI Image Generated!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    {isDummySelected ? "Catalog Preset Selected" : "Local Image Staged"}
                  </>
                )}
              </div>

              {!uploading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md opacity-0 group-hover:opacity-100"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg shadow-sm group-hover:scale-105 transition-transform mb-1">
                <UploadCloud className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </div>

              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-2">
                Click to select local file
              </p>

              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                Direct stream validation up to 5MB max
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* SECTION 2: AI Catalog Inspirations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            AI Image Generator Ideas
          </h2>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Select an asset framework structure from our catalog below to bootstrap your campaign.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {dummyPhotos.map((photo) => {
            const isActiveDummy = selectedImage === photo.src && isDummySelected;
            return (
              <div
                key={photo.id}
                onClick={() => {
                  if (uploading) return;
                  setSelectedImage(photo.src);
                  setLocalFile(null);
                  setUploadSuccess(false);
                  setIsDummySelected(true);
                }}
                className={`group relative aspect-square bg-neutral-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border transition-all hover:shadow-md ${
                  isActiveDummy
                    ? "border-blue-600 dark:border-blue-400 ring-2 ring-blue-500/20"
                    : "border-neutral-200/60 dark:border-zinc-700/60 hover:border-blue-500 dark:hover:border-blue-400"
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.tag}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] font-medium text-white text-center truncate">
                    {photo.tag}
                  </p>
                </div>
                {isActiveDummy && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white p-0.5 rounded-md shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Content Copy Prompts */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
          Product Copy & System Prompts
        </h2>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter semantic keywords or structural context descriptions..."
            rows={4}
            className="w-full text-xs p-3.5 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50/30 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Main Trigger Button */}
      <button
        onClick={handleGenerateStrategy}
        disabled={uploading}
        type="button"
        className="w-full font-bold text-xs rounded-xl py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating AI Image & Strategy...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Complete Strategy
          </>
        )}
      </button>
    </div>
  );
}