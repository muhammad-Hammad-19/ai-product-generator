"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Inbox, Megaphone, Settings, Wallet2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./ProfileAvatar";
import { useAuthContext } from "../provider";

const items = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Creative Tool",
    url: "/creative-tool",
    icon: Inbox,
  },
  {
    title: "My Ads",
    url: "#",
    icon: Megaphone,
  },
  {
    title: "Upgrade",
    url: "#",
    icon: Wallet2,
  },
  {
    title: "Profile",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  
  const { user } = useAuthContext();

  return (
    <Sidebar>
      {/* Sidebar Top Header Logo */}
      <SidebarHeader>
        <div className="p-4 flex flex-col items-center justify-center gap-2">
          <div className="relative w-32 h-10">
            <Image
              src="/logo.svg" /* Absolute path set kiya hai Next.js convention ke mutabiq */
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-xs font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Build Awesome
          </h2>
        </div>
      </SidebarHeader>

      {/* Main Navigation Links */}
      <SidebarContent>
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
                      <a href={item.url}>
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
                        />
                        <span>{item.title}</span>
                      </a>
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
          {/* CONDITION: User true hai toh sleek pill profile capsule render hoga */}
          {user ? (
            <div className="flex items-center justify-between w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
              {/* Profile Text (Left Side) */}
              <div className="flex flex-col text-left truncate min-w-0 pr-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight truncate">
                  {user.displayName || "My Profile"}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Active
                </span>
              </div>

              {/* Profile Avatar Component (Right Side) */}
              <div className="flex-shrink-0">
                <ProfileAvatar />
              </div>
            </div>
          ) : (
            /* User False hai toh Signup Button show hoga */
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
          Copyright @Tubeguruji
        </h2>
      </SidebarFooter>
    </Sidebar>
  );
}
