//@ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, Loader2, Sparkles } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";
import axios from "axios";

export default function LiveEnginePreview() {
  const { user } = useAuthContext();

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setAds([]);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "users-ads"),
      where("userEmail", "==", user?.email),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAds(data || []);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setAds([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.email]);

  const generateVideo = async (ad: any) => {
    try {
      const imageUrl = ad?.generatedImageUrl || ad?.originalImageUrl;

      if (!imageUrl) {
        alert("No image found");
        return;
      }

      setLoadingVideoId(ad.id);

      const res = await axios.post(
        "/api/generate-product-video",
        {
          imageUrl,
          docId: ad?.id,
          prompt:
            "A cinematic luxury product advertisement with slow rotation, dramatic lighting, ultra realistic studio look.",
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        alert("Video generation started / completed");
      } else {
        alert(res.data.error?.message || "Video generation failed");
      }
    } catch (err: any) {
      console.error("ERROR:", err.message);
      alert(err.message);
    } finally {
      setLoadingVideoId(null);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          AI Generated Ads
        </h2>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16 text-xs text-gray-500">
          No ads generated yet 🚀
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900"
            >
              {/* IMAGE */}
              <div className="aspect-square bg-black">
                <img
                  src={
                    ad.generatedImageUrl ||
                    ad.originalImageUrl ||
                    "/placeholder.png"
                  }
                  className="w-full h-full object-cover"
                  alt="Creative asset"
                />
              </div>

              {/* BUTTONS */}
              <div className="p-3 space-y-2">
                <p className="text-xs truncate">
                  {ad?.prompts?.textToImage || "AI Ad"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 text-xs py-1 rounded text-black bg-gray-100"
                  >
                    View
                  </button>

                  <button
                    onClick={() => generateVideo(ad)}
                    disabled={loadingVideoId === ad.id}
                    className="flex-1 text-xs py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
                  >
                    {loadingVideoId === ad.id ? "Generating..." : "Animate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (FIXED UI & RESPONSIVE) */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/70 overflow-y-auto"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 relative flex flex-col md:flex-row my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button placement inside container */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 right-3 z-20 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white/80 dark:bg-zinc-800/80 p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left/Top Column: Image wrapper */}
            <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800/80">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm max-h-[35vh] md:max-h-full">
                <img
                  src={
                    selectedAd.generatedImageUrl ||
                    selectedAd.originalImageUrl ||
                    "/placeholder.png"
                  }
                  className="w-full h-full object-cover"
                  alt="Modal Preview"
                />
              </div>
            </div>

            {/* Right/Bottom Column: Info Content */}
            <div className="w-full md:w-1/2 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full">
                    AI Asset Details
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Generation Prompt
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/60 p-3.5 rounded-xl max-h-[150px] overflow-y-auto">
                    <p className="text-xs text-gray-700 dark:text-zinc-300 italic leading-relaxed">
                      "{selectedAd?.prompts?.textToImage || "No prompt available for this AI Ad."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800/60">
                <button
                  onClick={() => generateVideo(selectedAd)}
                  disabled={loadingVideoId === selectedAd.id}
                  className="w-full text-xs font-semibold py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingVideoId === selectedAd.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Animate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}