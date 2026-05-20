"use client";

import React, { useState } from "react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import {
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Wand2,
  Terminal,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// Client-safe configuration environment extraction
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

// Dynamic auth handler communicating with our server router
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) throw new Error("Failed validation parameters fetch");
    console.log(response);
    return await response.json();
  } catch (error: any) {
    throw new Error(`Authentication token error: ${error.message}`);
  }
};

const ProductUpload = () => {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Local UI status flags for cloud uploads
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="w-full min-h-screen bg-neutral-50/50 dark:bg-zinc-950 p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: CONTROLS & INPUT PARAMETERS (7 COLS)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-8 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Campaign Studio
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure parameters, generate automated product listings, and
                launch ads.
              </p>
            </div>

            <hr className="border-neutral-100 dark:border-zinc-800" />

            {/* SECTION 1: AI Catalog Inspirations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
                  AI Image Generator Ideas
                </h2>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Select an asset framework structure from our catalog below to
                bootstrap your campaign.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-1">
                {dummyPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setSelectedImage(photo.src);
                      setUploadSuccess(false); // Clear custom upload status
                    }}
                    className="group relative aspect-square bg-neutral-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border border-neutral-200/60 dark:border-zinc-700/60 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-md"
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
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Custom ImageKit Upload Infrastructure */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
                Upload Original Product Asset via Cloud
              </h2>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-zinc-800 rounded-xl p-6 bg-neutral-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900/80 transition-all group">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : uploadSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-3">
                    {uploading
                      ? "Pushing file to CDN..."
                      : uploadSuccess
                        ? "Cloud Upload Done!"
                        : "Click to select local file"}
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Direct stream validation up to 5MB max
                  </p>
                </div>

                {/* Hidden Native SDK Client Component Hook */}
                <IKUpload
                  fileName="ai-engine-input.jpg"
                  useUniqueFileName={true}
                  validateFile={(file) => file.size < 5 * 1024 * 1024}
                  onUploadStart={() => {
                    setUploading(true);
                    setUploadSuccess(false);
                  }}
                  onError={(err) => {
                    setUploading(false);
                    console.error("ImageKit Stream Error:", err);
                  }}
                  onSuccess={(res) => {
                    setUploading(false);
                    setUploadSuccess(true);
                    setSelectedImage(res.url); // Dynamic update inside Live Preview Container
                  }}
                  className="hidden"
                />
              </label>
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

            <button
              type="button"
              className="w-full font-bold text-xs rounded-xl py-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Complete Strategy
            </button>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: LIVE MONITOR PREVIEW VIEW CONTEXT PANEL (5 COLS)
             ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-neutral-50 dark:bg-zinc-900/50 border-b border-neutral-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-[11px] font-bold tracking-wide uppercase text-neutral-500 dark:text-neutral-400">
                    Live Engine Preview
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80"></span>
                </div>
              </div>

              <div className="p-6 bg-neutral-50/30 dark:bg-zinc-950/20 min-h-[400px] flex flex-col justify-between gap-6">
                <div className="aspect-video w-full bg-neutral-100 dark:bg-zinc-800/50 border border-neutral-200/60 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-inner">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Live preview channel"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <ImageIcon className="w-8 h-8 text-neutral-300 dark:text-zinc-600 mb-2" />
                      <p className="text-xs font-medium text-neutral-400 dark:text-zinc-500">
                        No active configuration selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">
                      Live Prompt Description
                    </span>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed min-h-[40px]">
                      {description || (
                        <span className="text-neutral-400 italic">
                          Description string stream is empty...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ImageKitProvider>
  );
};

export default ProductUpload;
