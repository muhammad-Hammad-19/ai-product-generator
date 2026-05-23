"use client";

import React, { useState, useEffect } from "react";
import { Eye, Download, Sparkles, Heart, Loader2, X } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";

const DUMMY_ADS = [
  {
    id: "d1",
    generatedImageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80",
    size: "1024x1024",
    prompts: { textToImage: "Fresh mango splash with vibrant colors and luxury feel" },
  },
  {
    id: "d2",
    generatedImageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80",
    size: "1024x1536",
    prompts: { textToImage: "Cocktail burst campaign with cinematic lighting" },
  },
  {
    id: "d3",
    generatedImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    size: "1536x1024",
    prompts: { textToImage: "Pizza studio shot with dynamic ingredients flying around" },
  },
  {
    id: "d4",
    generatedImageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80",
    size: "1024x1024",
    prompts: { textToImage: "Salad fresh drop with health campaign aesthetic" },
  },
];

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

  useEffect(() => {
    if (user?.email) {
      fetchAds();
    } else {
      setAds(DUMMY_ADS);
    }
  }, [user]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "users-ads"),
        where("userEmail", "==", user?.email)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(data.length > 0 ? data : DUMMY_ADS);
    } catch (error) {
      setAds(DUMMY_ADS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          AI Generated Ads
        </h2>
        {ads === DUMMY_ADS && (
          <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 tracking-wide">
            Sample Products
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md dark:hover:border-zinc-700 transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-zinc-950">
                <img
                  src={ad.generatedImageUrl}
                  alt={`AI Generated Ad ${ad.id}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                  {ad.size ?? "1024x1024"}
                </div>
              </div>

              <div className="p-3 space-y-3">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate" title={ad.prompts?.textToImage}>
                  {ad.prompts?.textToImage ? `${ad.prompts.textToImage.slice(0, 40)}...` : "AI Generated Ad"}
                </p>

                <div className="flex gap-1.5">
                  {/* ✅ View — modal khulega */}
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-neutral-50 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-100 dark:hover:bg-zinc-700/80 transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>

                  <button
                    onClick={() => handleDownload(ad.generatedImageUrl, ad.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-medium hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </button>

                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-[10px] font-medium border border-violet-100 dark:border-violet-900/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-all">
                    <Sparkles className="w-3 h-3" />
                    Animate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ VIEW MODAL */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <img
              src={selectedAd.generatedImageUrl}
              alt="Full View"
              className="w-full object-cover"
            />

            {/* Info */}
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {selectedAd.prompts?.textToImage ?? "AI Generated Ad"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedAd.generatedImageUrl, selectedAd.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>

                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-200 dark:border-violet-900 hover:bg-violet-100 transition-all">
                  <Sparkles className="w-3.5 h-3.5" />
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