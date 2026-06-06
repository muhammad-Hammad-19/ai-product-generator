"use client";

import { auth } from "@/configs/firebaseConfig";
import { signOut } from "firebase/auth";
import React from "react";
import { useAuthContext } from "../provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

function ProfileAvatar() {
  const user = useAuthContext();
  const router = useRouter();

  const onLogout = async () => {
    try {
      await signOut(auth);
      // 🔥 redirect after logout
      localStorage.removeItem("user");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          {user?.user?.email && (
            <div className="w-[35px] h-[35px] rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user.user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-40 cursor-pointer">
          <button
            onClick={onLogout}
            className="w-full text-left hover:text-red-500"
          >
            Logout
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ProfileAvatar;
