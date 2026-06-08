"use client";

import React, { useEffect } from "react";
import AiToolList from "./_components/AiToolList";
import UserAdsList from "./_components/UserAdsList";
import { useAuthContext } from "@/app/provider";
import { useRouter } from "next/navigation"; // IMPORT: Redirection ke liye router hook import kiya

function AddHomePage() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // FIX: Agar auth loading khatam ho chuki hai aur user ya uska email nahi mila, toh login par redirect karo
    if (!user || !user.email) {
      router.push("/");
    }
  }, [user]);

  // Premium Loading State: Jab tak authentication state clear nahi hoti, tab tak loader dikhao}

  // Agar user successfully login hai aur email mojud hai, toh dashboard content render hoga
  return (
    <div className="space-y-2">
      <AiToolList />
      <UserAdsList />
    </div>
  );
}

export default AddHomePage;
