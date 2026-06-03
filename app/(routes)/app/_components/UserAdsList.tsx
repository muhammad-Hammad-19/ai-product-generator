"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Megaphone, Eye, Sparkles, Loader2, X } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/app/provider";
import { db } from "@/configs/firebaseConfig";

const UserAdsList = () => {
  const { user } = useAuthContext();
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchAds();
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
      setAdsList(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Heading */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Your Campaigns
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage and track your active product advertisements.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : adsList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 bg-neutral-50/50 dark:bg-neutral-900/30 text-center min-h-[350px]">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            You don't have any ads yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
            Your advertisement dashboard is currently empty. Start generating
            high-converting campaigns to reach your target audience.
          </p>
          <button
            type="button"
            onClick={() => console.log("Create new ad triggered!")}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-xs rounded-xl px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ad</span>
          </button>
        </div>
      ) : (
        /* Ads Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {adsList.map((ad) => (
            <div
              key={ad.id}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md dark:hover:border-zinc-700 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-zinc-950">
                <img
                  src={ad.generatedImageUrl || ad.originalImageUrl}
                  alt={`Ad ${ad.id}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                  {ad.size ?? "1024x1024"}
                </div>
                {/* Status badge */}
                {ad.status && (
                  <div
                    className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      ad.status === "completed"
                        ? "bg-green-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                    }`}
                  >
                    {ad.status}
                  </div>
                )}
              </div>

              {/* Info + Actions */}
              <div className="p-3 space-y-3">
                <p
                  className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate"
                  title={ad.prompts?.textToImage}
                >
                  {ad.prompts?.textToImage
                    ? `${ad.prompts.textToImage.slice(0, 40)}...`
                    : "AI Generated Ad"}
                </p>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-neutral-50 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-100 dark:hover:bg-zinc-700/80 transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>

                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-[10px] font-medium border border-violet-100 dark:border-violet-900/40 hover:bg-violet-100 transition-all">
                    <Sparkles className="w-3 h-3" />
                    Animate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={selectedAd.generatedImageUrl || selectedAd.originalImageUrl}
              alt="Full View"
              className="w-full object-cover"
            />

            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {selectedAd.prompts?.textToImage ?? "AI Generated Ad"}
              </p>

              <div className="flex gap-2">
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
};

export default UserAdsList;
