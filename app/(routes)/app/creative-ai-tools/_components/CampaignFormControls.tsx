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

  const [localFile, setLocalFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // DUMMY IMAGES
  // =========================

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

  // =========================
  // FILE CHANGE
  // =========================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Max 5MB validation
    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    setLocalFile(file);

    setUploadSuccess(false);

    setIsDummySelected(false);

    // Preview image
    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(previewUrl);
  };

  // =========================
  // GENERATE AI IMAGE
  // =========================

  const handleGenerateStrategy = async () => {
    if (!localFile && !isDummySelected) {
      alert("Please upload or select an image first");
      return;
    }

    try {
      setUploading(true);

      setUploadSuccess(false);

      const formData = new FormData();

      formData.append("description", description);

      // =========================
      // LOCAL FILE
      // =========================

      if (localFile) {
        formData.append("file", localFile);
      }

      // =========================
      // DUMMY IMAGE
      // =========================

      if (isDummySelected && selectedImage) {
        const response = await fetch(selectedImage);

        const blob = await response.blob();

        const file = new File([blob], "dummy-image.jpg", {
          type: "image/jpeg",
        });

        formData.append("file", file);
      }

      console.log("Sending AI Request...");

      // =========================
      // API CALL
      // =========================

      const response = await axios.post(
        "/api/generate-product-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("AI RESPONSE:", response.data);

      // =========================
      // SUCCESS
      // =========================

      if (response.data.success) {
        setUploadSuccess(true);

        // IMPORTANT FIX
        // generatedImageUrl use karo
        setSelectedImage(response.data.generatedImageUrl);
      }
    } catch (error: any) {
      console.error(
        "GENERATION ERROR:",
        error?.response?.data || error.message
      );

      alert("Image generation failed");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // REMOVE IMAGE
  // =========================

  const handleRemoveImage = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    e.stopPropagation();

    setSelectedImage(null);

    setLocalFile(null);

    setUploadSuccess(false);

    setIsDummySelected(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />

          Campaign Studio
        </h1>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          AI Product Ad Generator
        </p>
      </div>

      {/* UPLOAD */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Upload Product Image
        </h2>

        <div
          onClick={() =>
            !selectedImage &&
            !uploading &&
            fileInputRef.current?.click()
          }
          className="relative flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-zinc-800 rounded-xl p-6 bg-neutral-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900/80 transition-all min-h-[180px] overflow-hidden"
        >
          {selectedImage ? (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* STATUS */}
              <div className="absolute top-3 left-3 bg-white dark:bg-zinc-900 px-3 py-1 rounded-md text-[10px] font-bold shadow">
                {uploadSuccess ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Sparkles className="w-3 h-3" />
                    AI Generated
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Image Selected
                  </div>
                )}
              </div>

              {/* REMOVE */}
              {!uploading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white dark:bg-zinc-800 border rounded-lg shadow-sm mb-2">
                <UploadCloud className="w-5 h-5 text-neutral-500" />
              </div>

              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Click to upload image
              </p>

              <p className="text-[10px] text-neutral-400 mt-1">
                PNG / JPG up to 5MB
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

      {/* DUMMY IMAGES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />

          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            AI Inspiration Images
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {dummyPhotos.map((photo) => {
            const active =
              selectedImage === photo.src && isDummySelected;

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
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all ${
                  active
                    ? "border-blue-600 ring-2 ring-blue-500/20"
                    : "border-neutral-200 dark:border-zinc-700"
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.tag}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Prompt Description
        </h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Luxury mango juice ad with splashes..."
          rows={4}
          className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleGenerateStrategy}
        disabled={uploading}
        type="button"
        className="w-full font-bold text-xs rounded-xl py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-sm transition-all flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating AI Image...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate AI Ad
          </>
        )}
      </button>
    </div>
  );
}