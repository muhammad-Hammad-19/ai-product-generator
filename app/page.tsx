"use client";
import Image from "next/image";
import Link from "next/link";
import Authentication from "./_components/Authentication";
import { Button } from "@/components/ui/button";
import { auth } from "@/configs/firebaseConfig";
import ProfileAvatar from "./_components/ProfileAvatar";
import { useAuthContext } from "./provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const context = useAuthContext();
  const user = context?.user;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-900">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 text-sm dark:bg-neutral-800/80 dark:border-neutral-700">
        <nav
          className="max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Global"
        >
          {/* Logo Container */}
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              AI{" "}
              <span className="bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 text-transparent">
                Product
              </span>
            </span>
          </div>

          {/* Right Side Action */}
          <div className="flex items-center gap-x-4">
            {!user?.email ? (
              <Authentication>
                <button className="inline-flex items-center gap-x-2 font-medium text-gray-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-500 transition-colors py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Get Started
                </button>
              </Authentication>
            ) : (
              <ProfileAvatar />
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Main Title */}
          <div className="max-w-3xl mx-auto">
            <h1 className="block font-black text-gray-900 text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight dark:text-neutral-100">
              Build Something{" "}
              <span className="bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 text-transparent">
                With NextJs
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed dark:text-neutral-400">
              Revolutionize your content creation with our AI-powered app,
              delivering engaging and high-quality apps in seconds.
            </p>
          </div>

          {/* CTA Button Conditional Render */}
          <div className="mt-10 flex justify-center">
            {!user?.email ? (
              <Authentication>
                <button className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  Get started
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </Authentication>
            ) : (
              <button
                onClick={() => router.push("/app")}
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Go to App
                <svg
                  className="flex-shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <a
            className="group flex flex-col justify-between bg-white border border-gray-100 hover:border-transparent hover:shadow-xl rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-800/80"
            href="#"
          >
            <div>
              <div className="flex justify-center items-center size-11 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="10" height="14" x="3" y="8" rx="2" />
                  <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  25+ templates
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                  Responsive, and mobile-first project on the web
                </p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-x-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              Learn more
              <svg
                className="size-3.5 transition-transform group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>

          {/* Card 2 */}
          <a
            className="group flex flex-col justify-between bg-white border border-gray-100 hover:border-transparent hover:shadow-xl rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-800/80"
            href="#"
          >
            <div>
              <div className="flex justify-center items-center size-11 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Customizable
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                  Components are easily customized and extendable
                </p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-x-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              Learn more
              <svg
                className="size-3.5 transition-transform group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>

          {/* Card 3 */}
          <a
            className="group flex flex-col justify-between bg-white border border-gray-100 hover:border-transparent hover:shadow-xl rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-800/80"
            href="#"
          >
            <div>
              <div className="flex justify-center items-center size-11 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Free to Use
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                  Every component and plugin is well documented
                </p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-x-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              Learn more
              <svg
                className="size-3.5 transition-transform group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>

          {/* Card 4 */}
          <a
            className="group flex flex-col justify-between bg-white border border-gray-100 hover:border-transparent hover:shadow-xl rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-800/80"
            href="#"
          >
            <div>
              <div className="flex justify-center items-center size-11 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  24/7 Support
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                  Contact us 24 hours a day, 7 days a week
                </p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-x-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              Learn more
              <svg
                className="size-3.5 transition-transform group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
