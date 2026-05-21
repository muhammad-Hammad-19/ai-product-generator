"use client";

import React from "react";
import { Terminal, Image as ImageIcon } from "lucide-react";

interface PreviewProps {
  selectedImage: string | null;
  description: string;
}

export default function LiveEnginePreview({ selectedImage, description }: PreviewProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Visual Terminal Indicator Bar */}
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

      {/* Monitor Layout Stage */}
      <div className="p-6 bg-neutral-50/30 dark:bg-zinc-950/20 min-h-[400px] flex flex-col justify-between gap-6">
        
        {/* Dynamic Image Canvas Render */}
        <div className="aspect-video w-full bg-neutral-100 dark:bg-zinc-800/50 border border-neutral-200/60 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-inner">
          {selectedImage ? (
            <img src={selectedImage} alt="Live preview asset channel" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <ImageIcon className="w-8 h-8 text-neutral-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-medium text-neutral-400 dark:text-zinc-500">
                No active configuration selected
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Context Description Output Stream */}
        <div className="space-y-3 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">
              Live Prompt Description
            </span>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed min-h-[40px]">
              {description || <span className="text-neutral-400 italic">Description string stream is empty...</span>}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}