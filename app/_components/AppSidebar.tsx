//@ts-nocheck
"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Inbox,
  Megaphone,
  Settings,
  Wallet2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./ProfileAvatar";
import { useAuthContext } from "../provider";

// Premium dynamic links with actual path mapping
const items = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Creative Tool",
    url: "/app",
    icon: Inbox,
  },
  {
    title: "My Ads",
    url: "/app",
    icon: Megaphone,
  },
  {
    title: "Upgrade",
    url: "/app",
    icon: Wallet2,
  },
  {
    title: "Profile",
    url: "/app",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { user } = useAuthContext();

  return (
    <Sidebar>
      {/* ================= NAYI PREMIUM LOGO SECTION ================= */}
      <div className="px-6 pt-5 pb-3 border-b border-neutral-100 dark:border-neutral-800/60 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-900/20">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          {/* Logo Icon Container */}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 transform group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>

          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-neutral-900 dark:text-neutral-50 leading-none">
              AI{" "}
              <span className="bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 text-transparent">
                Product
              </span>
            </span>
            <span className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mt-0.5">
              Studio Suite
            </span>
          </div>
        </div>
      </div>
      {/* ============================================================= */}

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {items.map((item, index) => {
                const isActive = path === item.url;
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`w-full justify-start gap-3 px-3 py-5 rounded-lg font-medium text-sm transition-all
                        ${
                          isActive
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-semibold"
                            : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-50"
                        }`}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? "text-blue-600 dark:text-blue-400" : ""
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Bottom Footer Profile/Auth Section */}
      <SidebarFooter className="p-4 border-t border-neutral-100 dark:border-neutral-800 gap-4">
        <div className="w-full">
          {user ? (
            <div className="flex items-center justify-between w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
              <div className="flex flex-col text-left truncate min-w-0 pr-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight truncate">
                  {user.displayName || "My Profile"}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Active
                </span>
              </div>

              <div className="flex-shrink-0">
                <ProfileAvatar />
              </div>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="w-full font-semibold text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform active:scale-[0.98]"
            >
              Signup
            </Button>
          )}
        </div>

        {/* Footer Credit Text */}
        <h2 className="text-center text-neutral-400 dark:text-neutral-600 text-[10px] font-medium tracking-wide">
          Copyright @Hammad
        </h2>
      </SidebarFooter>
    </Sidebar>
  );
}
