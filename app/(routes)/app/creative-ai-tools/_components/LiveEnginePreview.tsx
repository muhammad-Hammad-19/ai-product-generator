// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";
import axios from "axios";

export default function LiveEnginePreview() {
  const { user } = useAuthContext();

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);

  const currentOpenAd = ads.find((ad) => ad.id === selectedAdId);

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
        const allData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sorting: Naye items pehle
        allData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const filteredAds = allData.filter((a) => a.generatedImageUrl);
        setAds(filteredAds);
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
      console.log(res.data);

      if (res.data.success) {
        alert(
          "Video generation started successfully! Please wait a few moments...",
        );
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

  // ==========================================
  // 🎯 STRICT BOUNDARY SEPARATION LOGIC (Cleaned)
  // ==========================================

  // 1️⃣ Category: Video Ads
  const videoAds = ads.filter(
    (ad) =>
      ad.videoUrl ||
      ad.imageToVideoStatus === "completed" ||
      ad.type === "video",
  );

  // 2️⃣ Category: Pure Images (Avatars merged here implicitly, but without showing faces)

  const imageAds = ads.filter(
    (ad) =>
      !ad.videoUrl &&
      ad.imageToVideoStatus !== "completed" &&
      ad.type !== "video",
  );

  // ✅ REUSABLE PREMIUM CARD COMPONENT
  const RenderCard = ({ ad }: { ad: any }) => (
    <div className="group border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between">
      {/* IMAGE / VIDEO THUMBNAIL */}
      <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
        <img
          src={
            ad.generatedImageUrl || ad.originalImageUrl || "/placeholder.png"
          }
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt="Creative asset"
        />

        {/* Avatar badge completely removed from here */}

        {ad.videoUrl && (
          <span className="absolute top-3 left-3 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-emerald-500/90">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Video Ready
          </span>
        )}
      </div>

      {/* CARD INFO & CONTROL BUTTONS */}
      <div className="p-4 space-y-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/50">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 h-8 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
          {ad?.description ||
            ad?.prompts?.textToImage ||
            ad?.prompt ||
            "AI Custom Generated Design Asset"}
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setSelectedAdId(ad.id)}
            className="flex-1 text-[11px] py-2 px-3 rounded-xl text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 font-bold transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98]"
          >
            View
          </button>

          {loadingVideoId === ad.id ? (
            <button
              disabled
              className="flex-1 text-[11px] py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center gap-1.5"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processing...</span>
            </button>
          ) : ad.videoUrl ? (
            <button
              disabled
              className="flex-1 text-[11px] py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </button>
          ) : (
            <button
              onClick={() => generateVideo(ad)}
              className="flex-1 text-[11px] py-2 px-3 rounded-xl bg-purple-600 text-white font-bold transition-all hover:bg-purple-700 active:scale-[0.98] shadow-sm shadow-purple-600/10 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Animate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* GLOBAL HEADLINE AREA */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
          AI Creative Control Dashboard
        </h2>
      </div>

      {/* RENDER CONTROLLER */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
            No production assets found in your database room 🚀
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 1️⃣ SECTION BLOCK: PRODUCT DISPLAYS (PURE IMAGES) */}
          {imageAds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Product Displays & Banners ({imageAds.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {imageAds.map((ad) => (
                  <RenderCard key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}

          {/* 2️⃣ SECTION BLOCK: AI VIDEO REELS */}
          {videoAds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                <VideoIcon className="w-4 h-4 text-pink-500" />
                <span>AI Motion Video Reels ({videoAds.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {videoAds.map((ad) => (
                  <RenderCard key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODERN PREVIEW MODAL WINDOW (Linear/Stripe Minimal Aesthetic) */}
      {currentOpenAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/60 overflow-y-auto transition-all"
          onClick={() => setSelectedAdId(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimal Header Panel */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm">
                {currentOpenAd.videoUrl ? "Cinematic Video" : "Studio Render"}
              </span>
              <button
                onClick={() => setSelectedAdId(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seamless Canvas Core Media */}
            <div className="p-5 pb-0 overflow-y-auto space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center shadow-inner">
                {currentOpenAd.videoUrl ? (
                  <video
                    src={currentOpenAd.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                    playsInline
                    muted
                  />
                ) : (
                  <img
                    src={
                      currentOpenAd.generatedImageUrl ||
                      currentOpenAd.originalImageUrl ||
                      "/placeholder.png"
                    }
                    className="w-full h-full object-cover"
                    alt="Expanded Engine Asset Preview"
                  />
                )}
                {/* Avatar image completely removed from Modal view */}
              </div>

              {/* Clean Blueprint Specification Info */}
              <div className="space-y-2 py-3">
                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  AI Generation Blueprint
                </h4>
                <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 p-4 rounded-xl max-h-[100px] overflow-y-auto shadow-sm">
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                    {currentOpenAd?.description ||
                      currentOpenAd?.prompts?.textToImage ||
                      currentOpenAd?.prompt ||
                      "Standard blueprint specification parameter applied."}
                  </p>
                </div>
              </div>
            </div>

            {/* Flat Footer Trigger Button */}
            <div className="p-5 pt-3 bg-white dark:bg-zinc-900">
              {loadingVideoId === currentOpenAd.id ? (
                <button
                  disabled
                  className="w-full text-xs font-bold py-3.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video Engine...</span>
                </button>
              ) : currentOpenAd.videoUrl ? (
                <button
                  disabled
                  className="w-full text-xs font-bold py-3.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Render Already Completed</span>
                </button>
              ) : (
                <button
                  onClick={() => generateVideo(currentOpenAd)}
                  className="w-full text-xs font-bold py-3.5 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Animate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
