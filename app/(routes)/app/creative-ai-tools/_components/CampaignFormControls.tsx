// @ts-nocheck
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
import { useAuthContext } from "@/app/provider";

interface FormProps {
  description: string;
  setDescription: (val: string) => void;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
  uploading: boolean;
  setUploading: (val: boolean) => void;
  uploadSuccess: boolean;
  setUploadSuccess: (val: boolean) => void;
  title: string;
  enableAvater?: boolean;
}

const IMAGE_SIZES = [
  { label: "Square", value: "1024x1024", tag: "1:1" },
  { label: "Portrait", value: "1024x1536", tag: "2:3" },
  { label: "Landscape", value: "1536x1024", tag: "3:2" },
];

const DUMMY_PHOTOS = [
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

const AVATAR_LIST = [
  {
    id: 1,
    name: "Sarah",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    id: 2,
    name: "James",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: 3,
    name: "Mia",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    id: 4,
    name: "Carlos",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: 5,
    name: "Aisha",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  },
];
export default function CampaignFormControls({
  description,
  setDescription,
  selectedImage,
  setSelectedImage,
  uploading,
  setUploading,
  uploadSuccess,
  setUploadSuccess,
  title,
  enableAvater = false,
}: FormProps) {
  const [isDummySelected, setIsDummySelected] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarName, setSelectedAvatarName] = useState<string | null>(
    null,
  );
  const { user } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }
    setLocalFile(file);
    setUploadSuccess(false);
    setIsDummySelected(false);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);
    setLocalFile(null);
    setUploadSuccess(false);
    setIsDummySelected(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!localFile && !isDummySelected) {
      alert("Please upload or select an image first");
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);

      const formData = new FormData();
      formData.append("description", description);
      formData.append("size", selectedSize);
      formData.append("userEmail", user?.email ?? "");
      formData.append("avatar", selectedAvatar ?? "");
      if (localFile) {
        formData.append("file", localFile);
      } else if (isDummySelected && selectedImage) {
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        formData.append(
          "file",
          new File([blob], "dummy-image.jpg", { type: "image/jpeg" }),
        );
      }

      const { data } = await axios.post(
        "/api/generate-product-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log(data);
      if (data.success) {
        setUploadSuccess(true);
        setSelectedImage(data.generatedImageUrl);
      }
    } catch (error: any) {
      alert("Image generation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6 shadow-sm max-w-md mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Campaign Studio
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {title ? title : ` AI Product Ad Generator`}
        </p>
      </div>

      {/* UPLOAD */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Upload Product Image
        </h2>
        <div
          onClick={() =>
            !selectedImage && !uploading && fileInputRef.current?.click()
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
          {DUMMY_PHOTOS.map((photo) => (
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
                selectedImage === photo.src && isDummySelected
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
          ))}
        </div>
      </div>

      {/* IMAGE SIZE */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Image Size
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {IMAGE_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              disabled={uploading}
              onClick={() => setSelectedSize(size.value)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                selectedSize === size.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 ring-2 ring-blue-500/20"
                  : "border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-neutral-400 hover:border-blue-400"
              }`}
            >
              <span className="font-bold">{size.label}</span>
              <span className="text-[10px] mt-0.5 opacity-60">{size.tag}</span>
              <span className="text-[9px] mt-0.5 opacity-50">{size.value}</span>
            </button>
          ))}
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

      {/* AVATARS */}
      {enableAvater && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Select Avatar
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_LIST.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => {
                  setSelectedAvatar(avatar.id);
                  setSelectedAvatarName(avatar.name);
                }}
                className={`flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar.id
                      ? "border-purple-600 ring-2 ring-purple-400/30"
                      : "border-neutral-200 dark:border-zinc-700"
                  }`}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                  {avatar.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={handleGenerate}
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

      {/* VIDEO PLAYER */}
      {videoUrl && (
        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-zinc-700">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
