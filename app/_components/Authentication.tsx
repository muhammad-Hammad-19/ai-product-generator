"use client";
import { auth } from "@/configs/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation"; // FIXED: next/navigation use kiya
import React from "react";

function Authentication({ children }: { children: React.ReactNode }) {
  const provider = new GoogleAuthProvider();
  const router = useRouter();

  const onButtonPress = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;

        if (user) {
          // 1. Data ka object banaya jaisa aapko chahiye tha
          const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          };

          // 2. Hathon-hath local storage me save karwaya
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("Data saved to localStorage successfully!");

          // 3. Aur instantly /app par navigate karwa diya
          router.push("/app");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Login Error:", errorMessage);
      });
  };
  
  return (
    <div onClick={onButtonPress} className="w-full inline-block cursor-pointer">
      {children}
    </div>
  );
}

export default Authentication;