// @ts-nocheck
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const AiToolList = () => {
  // All 3 core features combined into one ultimate flagship tool object
  
  const unifiedTool = {
    title: "All-in-One AI Product Engine",
    desc: "Generate professional product images, design custom studio avatars, and animate your creations instantly into cinematic Videos,",
    type: "Images • Avatars • Videos",
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop",
    badgeColor:
      "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-blue-600 dark:text-pink-400 font-bold",
    url: "/app/creative-ai-tools/product-images", // Directs to your main unified app workspace
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      {/* Header Segment */}
      <div className="mb-10 text-left">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-2xl">
          Creative Tools
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Access our unified AI engine to build world-class product marketing
          assets.
        </p>
      </div>

      {/* Premium Single Flagship Card Layout (Stripe/Linear Inspired) */}
      <Link
        href={unifiedTool.url}
        className="group flex flex-col md:flex-row bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 min-h-[220px] cursor-pointer relative"
      >
        {/* LEFT SIDE: Content Info */}
        <div className="flex flex-col flex-1 p-6 sm:p-8 text-left justify-between h-full min-w-0 z-10">
          <div>
            {/* Unified Multi-Feature Badge */}
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 ${unifiedTool.badgeColor}`}
            >
              {unifiedTool.type}
            </span>

            {/* Main Title */}
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight sm:text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {unifiedTool.title}
            </h3>

            {/* Description */}
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
              {unifiedTool.desc}
            </p>
          </div>

          {/* Premium Call to Action Button */}
          <div className="mt-6">
            <span className="inline-flex items-center justify-center font-semibold text-xs rounded-xl px-5 py-2.5 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all active:scale-[0.98]">
              Open AI Workspace
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Visual Preview Asset */}
        <div className="relative w-full md:w-56 lg:w-64 h-48 md:h-auto bg-neutral-50 dark:bg-neutral-800/50 overflow-hidden flex-shrink-0 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800/50">
          <Image
            src={unifiedTool.image}
            alt={unifiedTool.title}
            fill
            sizes="(max-w-768px) 100vw, 30vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
          {/* Subtle Linear Edge Gradient Overlay */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white dark:from-neutral-900 via-transparent to-transparent opacity-60" />
        </div>
      </Link>
    </div>
  );
};

export default AiToolList;
