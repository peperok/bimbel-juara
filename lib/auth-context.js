"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut as fbSignOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  loginEmail: async () => {},
  registerEmail: async () => {},
  loginGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from users/{uid}
  const syncUserProfile = async (firebaseUser, defaultName = "") => {
    if (!firebaseUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
      } else {
        // Buat baru jika belum ada, dengan role awal: "siswa"
        const newProfile = {
          nama: defaultName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Siswa Baru",
          email: firebaseUser.email || "",
          noHp: "",
          noHpOrangTua: "",
          role: "siswa",
          aktif: true,
          dibuatPada: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("Error reading/writing user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await syncUserProfile(currUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerEmail = async (nama, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await syncUserProfile(res.user, nama);
    return res;
  };

  const loginGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(res.user);
    return res;
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginEmail,
        registerEmail,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
