"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, loginEmail, loginGoogle } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Jika sudah login, alihkan otomatis sesuai peran
  useEffect(() => {
    if (!authLoading && user && profile) {
      const role = profile.role || "siswa";
      if (role === "staf") router.push("/staf");
      else if (role === "tutor") router.push("/tutor");
      else if (role === "super_admin") router.push("/admin");
      else router.push("/beranda");
    }
  }, [user, profile, authLoading, router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginEmail(email, password);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Email atau kata sandi tidak sesuai.");
      } else {
        setError("Gagal masuk. Periksa koneksi internet Anda.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginGoogle();
    } catch (err) {
      console.error(err);
      setError("Gagal masuk dengan Google. Pastikan popup tidak diblokir.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F7F5F2]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#EA580C] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Masuk ke Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Portal Belajar Bimbel Langkah Juara</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition duration-150 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">Atau dengan Email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white font-semibold py-3 rounded-xl text-sm transition duration-150 shadow-sm mt-2 disabled:opacity-70"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-[#EA580C] font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
