"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link"; // Next.js fast navigation support tracking

const AiToolList = () => {
  // Mock Data Array with premium destination folder routing paths
  const tools = [
    {
      id: 1,
      title: "AI Product Banner Generator",
      desc: "Create high-converting, professional product banners for your brand using advanced AI instantly.",
      type: "Photo Tool",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      url: "/app/creative-ai-tools/product-images", // Route pointing straight to your product workspace folder
    },
    {
      id: 2,
      title: "Cinematic Product Video Reel",
      desc: "Transform static product descriptions into highly engaging 4K video promos and social media motion reels.",
      type: "Video Tool",
      image:
        "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500&auto=format&fit=crop",
      badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
      url: "/app/creative-ai-tools/product-images",
    },
    {
      id: 3,
      title: "Smart Background Remover",
      desc: "Isolate your products with absolute pixel perfection. Replace busy backgrounds with studio drops.",
      type: "Photo Tool",
      image:
        "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=500&auto=format&fit=crop",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      url: "/app/creative-ai-tools/product-images",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Main Section Heading */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Creative Tools
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Select an AI powerhouse to begin generating world-class product
          assets.
        </p>
      </div>

      {/* Grid Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Link
            key={tool.id}
            href={tool.url}
            className="group flex flex-row bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 h-48 cursor-pointer"
          >
            {/* LEFT SIDE: Text Content & Button Area */}
            <div className="flex flex-col flex-1 p-4 text-left justify-between h-full min-w-0">
              <div>
                {/* Tool Type Tag */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide mb-1.5 ${tool.badgeColor}`}
                >
                  {tool.type}
                </span>

                {/* Title */}
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed line-clamp-3">
                  {tool.desc}
                </p>
              </div>

              {/* Call to Action Button */}
              <div className="mt-2">
                <span className="inline-flex items-center justify-center font-semibold text-[11px] rounded-lg px-3 py-1.5 bg-blue-600 group-hover:bg-blue-700 text-white shadow-sm transition-colors active:scale-[0.98]">
                  Create Now
                </span>
              </div>
            </div>

            {/* RIGHT SIDE: Photo Area */}
            <div className="relative w-28 md:w-32 h-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border-l border-neutral-100 dark:border-neutral-800">
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                sizes="(max-w-768px) 30vw, 15vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={index < 3}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AiToolList;
