"use client";

import React, { useState, useEffect } from "react";
import { Heart, Loader2, X } from "lucide-react";
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
    link.download = `${title || "image"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch {
    alert("Download failed");
  }
};

export default function LiveEnginePreview() {
  const { user } = useAuthContext();

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  // ✅ FIX: per-ad loading (important)
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

  // ✅ FIXED VIDEO GENERATION
  const generateVideo = async (ad: any) => {
    try {
      const imageUrl = ad?.generatedImageUrl || ad?.originalImageUrl;

      if (!imageUrl) {
        alert("No image found");
        return;
      }

      const res = await axios.post(
        "/api/generate-product-video",
        {
          imageUrl,
          prompt:
            "A cinematic luxury product advertisement with slow rotation, dramatic lighting, liquid splash effects, ultra realistic studio look.",
        },
        {
          withCredentials: true,
        },
      );
      console.log(res.data);

      if (res.data.success) {
        alert("Video request sent");
        console.log(res.data.data);
      } else {
        alert(res.data.error);
      }
    } catch (err: any) {
      alert(err.message);
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
                    className="flex-1 text-xs py-1 rounded bg-gray-100"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      handleDownload(
                        ad.generatedImageUrl || ad.originalImageUrl,
                        ad.id,
                      )
                    }
                    className="flex-1 text-xs py-1 rounded bg-blue-600 text-white"
                  >
                    Save
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

      {/* MODAL */}
      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 right-3 text-white bg-black/60 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            {/* IMAGE */}
            <img
              src={
                selectedAd.generatedImageUrl ||
                selectedAd.originalImageUrl ||
                "/placeholder.png"
              }
              className="w-full max-h-[70vh] object-contain bg-black"
            />

            {/* ACTIONS */}
            <div className="p-4 space-y-3">
              <p className="text-xs">
                {selectedAd?.prompts?.textToImage || "AI Ad"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleDownload(
                      selectedAd.generatedImageUrl ||
                        selectedAd.originalImageUrl,
                      selectedAd.id,
                    )
                  }
                  className="flex-1 text-xs py-2 rounded bg-blue-600 text-white"
                >
                  Download
                </button>

                <button
                  onClick={() => generateVideo(selectedAd)}
                  disabled={loadingVideoId === selectedAd.id}
                  className="flex-1 text-xs py-2 rounded bg-purple-100 text-purple-700"
                >
                  {loadingVideoId === selectedAd.id
                    ? "Generating..."
                    : "Animate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
