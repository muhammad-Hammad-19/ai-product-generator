//@ts-nocheck

"use client";
import { auth } from "@/configs/firebaseConfig";
import { AuthContext } from "@/context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Structured user interface jaisa aapne manga tha
interface CustomUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: CustomUser | null;
}

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Page load hote hi sabse pehle bina kisi delay ke Local Storage se data uthao
  const [user, setUser] = useState<CustomUser | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase se data lekar local storage ke format me set karo
        const userData: CustomUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };

        // Agar local storage me pehle se data nahi hai ya data different hai, tabhi save karo
        
        const localData = localStorage.getItem("user");
        if (!localData || JSON.parse(localData).uid !== firebaseUser.uid) {
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        // Agar user logout ho jaye to local storage saaf kar do
        localStorage.removeItem("user");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NextThemesProvider {...props}>
      <AuthContext.Provider value={{ user }}>
        <div>{children}</div>
      </AuthContext.Provider>
    </NextThemesProvider>
  );
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default Provider;
