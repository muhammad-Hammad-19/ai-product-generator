"use client"; // Required for state management in Next.js App Router

import React, { useState } from 'react';
import { PlusCircle, Megaphone } from 'lucide-react'; 

const UserAdsList = () => {
  // 1. State initialized as an empty array
  const [adsList, setAdsList] = useState([]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Section Heading */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Your Campaigns
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage and track your active product advertisements.
        </p>
      </div>

      {/* 2. Conditional Rendering: When list is empty (length === 0) */}
      {adsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 bg-neutral-50/50 dark:bg-neutral-900/30 text-center min-h-[350px]">
          
          {/* Central Icon Graphic */}
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Megaphone className="w-8 h-8" />
          </div>

          {/* Main English Alert Text */}
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            You don't have any ads yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
            Your advertisement dashboard is currently empty. Start generating high-converting campaigns to reach your target audience.
          </p>

          {/* Action Button with integrated icon */}
          <button
            type="button"
            onClick={() => {
              console.log("Create new ad triggered!");
            }}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-xs rounded-xl px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ad</span>
          </button>

        </div>
      ) : (
        /* 3. Render grid layout when data is populated */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-sm text-neutral-500">Your active campaigns will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default UserAdsList;