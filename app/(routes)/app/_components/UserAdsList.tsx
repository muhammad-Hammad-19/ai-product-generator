// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Megaphone,
  Eye,
  Sparkles,
  Loader2,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";

const UserAdsList = () => {
  const { user } = useAuthContext();
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchAds();
    } else if (user === null) {
      setLoading(false);
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

      // Sorting: Naye items hamesha pehle
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAdsList(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🎯 STRICT SEPARATION LOGIC (Images vs Videos)
  // ==========================================
  const videoAds = adsList.filter(
    (ad) =>
      ad.videoUrl ||
      ad.imageToVideoStatus === "completed" ||
      ad.type === "video",
  );
  const imageAds = adsList.filter(
    (ad) =>
      !ad.videoUrl &&
      ad.imageToVideoStatus !== "completed" &&
      ad.type !== "video",
  );

  // ✅ REUSABLE MINIMAL CARD COMPONENT
  const RenderAdCard = ({ ad }: { ad: any }) => (
    <div
      key={ad.id}
      className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Media Source Block */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-zinc-950 border-b border-neutral-100 dark:border-zinc-800/50">
        {ad.videoUrl ? (
          <video
            src={ad.videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          />
        ) : (
          <img
            src={
              ad.generatedImageUrl || ad.originalImageUrl || "/placeholder.png"
            }
            alt={`Asset Display`}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        )}

        {/* Info Meta Badges */}
        <div className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {ad.size ?? "1024x1024"}
        </div>

        {ad.videoUrl && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            Motion
          </div>
        )}
      </div>

      {/* Info + Clean Controls */}
      <div className="p-3.5 space-y-3">
        <p className="text-xs font-medium text-neutral-500 dark:text-zinc-400 truncate">
          {ad.description ||
            ad.prompts?.textToImage ||
            ad.prompt ||
            "AI Core Generated Asset"}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedAd(ad)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold transition-all hover:bg-neutral-200/70 dark:hover:bg-zinc-700/80 active:scale-[0.98]"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>

          {!ad.videoUrl && (
            <button
              onClick={() => setSelectedAd(ad)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold hover:bg-purple-100 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Animate
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Dynamic Header Frame */}
      <div className="mb-8 text-left border-b border-neutral-100 dark:border-zinc-800/60 pb-5">
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase">
          Your Creative Hub
        </h2>
        <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-1 font-medium">
          Manage and monitor your specialized AI product marketing workflows.
        </p>
      </div>

      {/* Main Loader State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : adsList.length === 0 ? (
        /* Empty Database Layout */
        <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 bg-neutral-50/30 dark:bg-zinc-900/10 text-center min-h-[350px]">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 rounded-2xl flex items-center justify-center mb-4 border border-neutral-200/60 dark:border-neutral-700/50 shadow-sm">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            No Production Framework Setup
          </h3>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed font-medium">
            Your live engine dashboard is empty. Initiate high-end graphics
            creation right now.
          </p>
          <button
            type="button"
            onClick={() => console.log("Create new ad triggered!")}
            className="mt-6 inline-flex items-center gap-2 font-bold text-xs rounded-xl px-5 py-2.5 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Engine Node</span>
          </button>
        </div>
      ) : (
        /* Categorized Render Container Stack */
        <div className="space-y-12">
          {/* SECTION 1: PURE IMAGES & DISPLAYS */}
          {imageAds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Product Displays & Banners ({imageAds.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageAds.map((ad) => (
                  <RenderAdCard key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MOTION VIDEO CAMPAIGNS */}
          {videoAds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider pl-0.5">
                <VideoIcon className="w-3.5 h-3.5 text-pink-500" />
                <span>AI Motion Video Reels ({videoAds.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videoAds.map((ad) => (
                  <RenderAdCard key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STRIPE-STYLE MODERN VIEW MODAL */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/40 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full border border-neutral-200/80 dark:border-neutral-800/80 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar Config */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-zinc-900/50">
              <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-zinc-700 shadow-sm">
                {selectedAd.videoUrl
                  ? "Cinematic Ad View"
                  : "Static Studio Node"}
              </span>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Media Display Area */}
            <div className="p-5 pb-0 overflow-y-auto space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-neutral-200/50 dark:border-zinc-800/50 bg-neutral-100 dark:bg-zinc-950 flex items-center justify-center shadow-inner">
                {selectedAd.videoUrl ? (
                  <video
                    src={selectedAd.videoUrl}
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
                      selectedAd.generatedImageUrl ||
                      selectedAd.originalImageUrl ||
                      "/placeholder.png"
                    }
                    alt="Expanded Canvas Display"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Prompt Blueprint Codebox */}
              <div className="space-y-2 py-2">
                <h4 className="text-[10px] font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">
                  Generation Blueprint Text
                </h4>
                <div className="bg-neutral-50 dark:bg-zinc-950/40 border border-neutral-200/80 dark:border-zinc-800/60 p-4 rounded-xl max-h-[100px] overflow-y-auto shadow-sm">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                    {selectedAd.description ||
                      selectedAd.prompts?.textToImage ||
                      selectedAd.prompt ||
                      "Standard setup sequence specification configuration active."}
                  </p>
                </div>
              </div>
            </div>

            {/* Seamless Bottom Controls */}
            <div className="p-5 pt-2 bg-white dark:bg-zinc-900">
              {selectedAd.videoUrl ? (
                <button
                  onClick={() => setSelectedAd(null)}
                  className="w-full text-xs font-bold py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-all text-center"
                >
                  Dismiss Preview
                </button>
              ) : (
                <button
                  onClick={() => {
                    console.log(
                      "Trigger generation framework inside UserAdsList component context:",
                      selectedAd,
                    );
                    alert(
                      "Video engine pipeline initiated from Campaign view!",
                    );
                  }}
                  className="w-full text-xs font-bold py-3.5 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Animate Production Canvas</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdsList;
