"use client";
import { auth } from "@/configs/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Image from "next/image";
import React, { useEffect } from "react";
import { useAuthContext } from "../provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function ProfileAvatar() {
  const user = useAuthContext();
  const router = useRouter();
  const onButtonPress = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        router.replace("/");
      })
      .catch((error) => {
        // An error happened.
      });
  };
  
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          {user?.user?.email && (
            <div className="w-[35px] h-[35px] rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-full mx-w-lg cursor-pointer">
          <h2 onClick={onButtonPress}>Logout</h2>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ProfileAvatar;
