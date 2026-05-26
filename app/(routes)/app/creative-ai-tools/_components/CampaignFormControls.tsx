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
      
      if (data.success) {
        setUploadSuccess(true);
        setSelectedImage(data.generatedImageUrl);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Generation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 rounded-2xl bg-white dark:bg-zinc-900">
      {/* IMAGE UPLOAD */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border p-4 rounded-xl cursor-pointer"
      >
        {selectedImage ? (
          <div className="relative">
            <img src={selectedImage} className="rounded-xl w-full" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud />
            Upload Image
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </div>

      {/* SIZE */}
      <div className="flex gap-2">
        {IMAGE_SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => setSelectedSize(s.value)}
            className={
              selectedSize === s.value
                ? "bg-blue-500 text-white p-2"
                : "p-2 border"
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Prompt..."
      />

      {/* AVATAR */}
      {enableAvater && (
        <div className="grid grid-cols-3 gap-2">
          {AVATAR_LIST.map((a) => (
            <div
              key={a.id}
              onClick={() => {
                setSelectedAvatar(a.image);
                setSelectedAvatarName(a.name);
              }}
              className={`cursor-pointer border rounded-xl p-2 ${
                selectedAvatar === a.image ? "border-blue-500" : ""
              }`}
            >
              <img src={a.image} className="rounded-full w-12 h-12 mx-auto" />
              <p className="text-xs text-center">{a.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* GENERATE */}
      <button
        onClick={handleGenerate}
        disabled={uploading}
        className="w-full bg-blue-600 text-white p-3 rounded-xl"
      >
        {uploading ? "Generating..." : "Generate AI Ad"}
      </button>
    </div>
  );
}
