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
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [selectedSize, setSelectedSize] = useState("1024x1024");

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarName, setSelectedAvatarName] = useState<string | null>(
    null,
  );

  const { user } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFile(file);
    setUploadSuccess(false);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedImage(null);
    setLocalFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!localFile && !selectedImage) {
      alert("Upload or select image first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("description", description);
      formData.append("size", selectedSize);
      formData.append("userEmail", user?.email ?? "");
      formData.append("avatar", selectedAvatar ?? "");

      if (localFile) {
        formData.append("file", localFile);
      } else if (selectedImage) {
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        formData.append("file", new File([blob], "image.jpg"));
      }

      const { data } = await axios.post(
        "/api/generate-product-image",
        formData,
      );
      
      console.log(data, "data");

      // if (data.success) {
      //   setUploadSuccess(true);
      //   setSelectedImage(data.generatedImageUrl);
      // }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Generation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl transition-all">
      {/* SECTION: IMAGE UPLOAD */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Base Image
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center transition-all min-h-[160px]
        ${
          selectedImage
            ? "border-zinc-200 dark:border-zinc-800 p-2"
            : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-blue-50/10"
        }`}
        >
          {selectedImage ? (
            <div className="relative w-full overflow-hidden rounded-xl group/img">
              <img
                src={selectedImage}
                className="rounded-xl w-full max-h-[300px] object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                alt="Selected preview"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl" />
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 1. Pehle event ko upar jane se rokein
                  handleRemoveImage(); // 2. Phir image remove karein
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-zinc-900/90 hover:bg-red-500 hover:text-white text-zinc-700 dark:text-zinc-300 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2 pointer-events-none">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Click to upload image
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Supports PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800" />

      {/* SECTION: ASPECT RATIO / SIZE */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-2">
          {IMAGE_SIZES.map((s) => {
            const isActive = selectedSize === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setSelectedSize(s.value)}
                className={`flex-1 min-w-[80px] text-xs font-medium px-3 py-2.5 rounded-xl transition-all border text-center
              ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750"
              }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: DESCRIPTION / PROMPT */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          AI Prompt & Scene Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-zinc-200 dark:border-zinc-700 bg-transparent p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 transition-all placeholder:text-zinc-400 resize-none"
          placeholder="Describe the background, lighting, and vibe of your AI ad... (e.g., 'Cinematic lighting, product on a marble table with neon lights')"
        />
      </div>

      {/* SECTION: AVATAR SELECTION */}
      {enableAvater && (
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Select AI Model / Avatar
            </label>
            {selectedAvatarName && (
              <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                {selectedAvatarName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {AVATAR_LIST.map((a) => {
              const isSelected = selectedAvatar === a.image;
              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAvatar(a.image);
                    setSelectedAvatarName(a.name);
                  }}
                  className={`group/avatar relative cursor-pointer border rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all bg-zinc-50/30 dark:bg-zinc-800/20
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 ring-2 ring-blue-500/20"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
                >
                  <div className="relative">
                    <img
                      src={a.image}
                      className={`w-12 h-12 rounded-full object-cover border-2 transition-transform duration-200 group-hover/avatar:scale-105
                    ${isSelected ? "border-blue-500" : "border-zinc-100 dark:border-zinc-800"}`}
                      alt={a.name}
                    />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-zinc-900">
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-2 font-medium text-center truncate w-full ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}
                  >
                    {a.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: GENERATE BUTTON */}
      <button
        onClick={handleGenerate}
        disabled={uploading}
        className={`w-full font-semibold p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
      ${
        uploading
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
          : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99]"
      }`}
      >
        {uploading ? (
          <>
            {/* Simple inline CSS spinner */}
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            <span>Generating Ad...</span>
          </>
        ) : (
          <>
            <span>Generate AI Ad</span>
          </>
        )}
      </button>
    </div>
  );
}
