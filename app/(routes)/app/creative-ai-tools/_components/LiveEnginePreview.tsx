"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, Loader2, Sparkles } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";
import axios from "axios";

export default function LiveEnginePreview() {
  const { user } = useAuthContext();

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  // ✅ FIX: per-ad loading active state
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) fetchAds();
    else setAds([]);
  }, [user]);

  const fetchAds = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "users-ads"),
        where("userEmail", "==", user?.email),
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAds(data || []);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async (ad: any) => {
    try {
      const imageUrl = ad?.generatedImageUrl || ad?.originalImageUrl;

      if (!imageUrl) {
        alert("No image found");
        return;
      }

      // 🔥 loading state ON
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

      console.log("VIDEO RESPONSE:", res.data);

      if (res.data.success) {
        alert("Video generation started / completed");

        // if video URL returned
        if (res.data.videoUrl) {
          console.log("VIDEO URL:", res.data.videoUrl);
        } else {
          console.log("Task response:", res.data.data);
        }
      } else {
        alert(res.data.error?.message || "Video generation failed");
      }
    } catch (err: any) {
      console.error("ERROR:", err.message);
      alert(err.message);
    } finally {
      // 🔥 loading OFF
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

                  {/* ✅ FIXED ANIMATE BUTTON */}
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

      {selectedAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/70 animate-in fade-in duration-200"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON (Top Right of the Modal) */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-gray-100 dark:bg-zinc-800 hover:scale-105 p-2 rounded-full transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT SIDE: IMAGE CONTAINER */}
            <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 p-4 md:p-6 min-h-[300px] md:min-h-0">
              <div className="relative w-full h-full max-h-[40vh] md:max-h-full aspect-square rounded-2xl overflow-hidden shadow-md">
                <img
                  src={
                    selectedAd.generatedImageUrl ||
                    selectedAd.originalImageUrl ||
                    "/placeholder.png"
                  }
                  className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-300"
                  alt="Modal Preview"
                />
              </div>
            </div>

            {/* RIGHT SIDE: CONTENT & ACTIONS */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4 pt-4 md:pt-6">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full">
                    AI Asset Details
                  </span>
                </div>

                {/* PROMPT CONTAINER */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Generation Prompt
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/60 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-zinc-300 italic leading-relaxed">
                      "
                      {selectedAd?.prompts?.textToImage ||
                        "No prompt available for this AI Ad."}
                      "
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/60 flex items-center gap-3">
                <button
                  onClick={() => generateVideo(selectedAd)}
                  disabled={loadingVideoId === selectedAd.id}
                  className="w-full text-sm font-medium py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white shadow-lg shadow-purple-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loadingVideoId === selectedAd.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
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
