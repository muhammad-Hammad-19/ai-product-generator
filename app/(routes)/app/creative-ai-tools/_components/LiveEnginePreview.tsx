"use client";

import React, { useState, useEffect } from "react";
import { Eye, Download, Sparkles, Heart, Loader2, X } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";
import axios from "axios";

const handleDownload = async (imageUrl: string, title: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert("Download failed");
  }
};

export default function LiveEnginePreview() {
  const { user } = useAuthContext();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null); // ✅ modal state

  const firstAd = ads[0];
  const { originalImageUrl, id } = firstAd ?? {};

  useEffect(() => {
    if (user?.email) {
      fetchAds();
    } else {
      setAds([]);
    }
  }, [user]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "users-ads"),
        where("userEmail", "==", user?.email),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(data.length > 0 ? data : []);
    } catch (error) {
      setAds([]);
    } finally {
      setLoading(false);
    }
  }
  
  const generateVideo = async () => {
    try {
      console.log("imageUrl:", originalImageUrl); // ← undefined hai?
      console.log("docId:", id); // ← undefined hai?
      console.log("uid:", user?.uid);
      const res = await axios.post("/api/generate-product-video", {
        imageUrl: originalImageUrl,
        imageToVideoPrompt:
          "A sleek product spins slowly in the center of the frame as vibrant liquid splashes burst outward in slow motion, drenching the screen in rich color. Golden light beams sweep across the product surface creating a luxurious shimmer, while floating ingredients orbit gracefully around it. The camera pulls back dramatically to reveal the full explosive scene against a bold gradient background, ending with the product front and center in cinematic focus.",
        uid: user.uid,
        docId: id,
      });

      console.log(res, "video data");

      if (res.data.success) {
        console.log(res.data.videoUrl);
      } else {
        alert("Video generation failed: " + res.data.error.me);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          AI Generated Ads
        </h2>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : ads?.length === 0 ? (
        /* EMPTY STATE */
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 text-xs">
          No ads generated yet. Create your first AI ad 🚀
        </div>
      ) : (
        /* GRID */
        <div className="grid grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all"
            >
              {/* IMAGE */}
              <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-zinc-950">
                <img
                  src={
                    ad?.generatedImageUrl ||
                    ad?.originalImageUrl ||
                    "/placeholder.png"
                  }
                  alt="AI Ad"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />

                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-md">
                  {ad?.size || "1024x1024"}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-3 space-y-3">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {ad?.prompts?.textToImage || "AI Generated Advertisement"}
                </p>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 py-1.5 text-[10px] rounded-xl bg-neutral-100 dark:bg-zinc-800"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      handleDownload(
                        ad?.generatedImageUrl || ad?.originalImageUrl,
                        ad?.id,
                      )
                    }
                    className="flex-1 py-1.5 text-[10px] rounded-xl bg-blue-600 text-white"
                  >
                    Save
                  </button>

                  <button className="flex-1 py-1.5 text-[10px] rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600">
                    Animate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 right-3 bg-black/60 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            {/* IMAGE */}
            <div className="max-h-[70vh] overflow-hidden bg-black">
              <img
                src={
                  selectedAd?.generatedImageUrl ||
                  selectedAd?.originalImageUrl ||
                  "/placeholder.png"
                }
                alt="Ad Preview"
                className="w-full h-full object-contain"
              />
            </div>

            {/* FOOTER */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-neutral-700 dark:text-neutral-200">
                {selectedAd?.prompts?.textToImage ||
                  "AI Generated Advertisement"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleDownload(
                      selectedAd?.generatedImageUrl ||
                        selectedAd?.originalImageUrl,
                      selectedAd?.id,
                    )
                  }
                  className="flex-1 py-2 text-xs rounded-xl bg-blue-600 text-white"
                >
                  Download
                </button>

                <button className="flex-1 py-2 text-xs rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600">
                  Animate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
