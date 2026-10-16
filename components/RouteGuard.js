"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function RouteGuard({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/masuk");
    }
  }, [user, loading, router]);

  // Layar Memuat... selama role belum selesai dibaca dari users/{uid}
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2]">
        <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">Memuat...</p>
        <p className="text-gray-500 text-sm mt-1">Menyiapkan hak akses Anda</p>
      </div>
    );
  }

  // Pengguna belum login
  if (!user) {
    return null;
  }

  // Akun dinonaktifkan
  if (profile && profile.aktif === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-200 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akun Dinonaktifkan</h1>
          <p className="text-gray-600 mb-6">
            Akun Anda dinonaktifkan. Hubungi staf Langkah Juara untuk informasi lebih lanjut.
          </p>
          <button
            onClick={() => window.location.href = "/masuk"}
            className="w-full bg-gray-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Kembali ke Halaman Masuk
          </button>
        </div>
      </div>
    );
  }

  // Periksa peran: super_admin boleh membuka semuanya
  const userRole = profile?.role || "siswa";
  const isSuperAdmin = userRole === "super_admin";
  const hasAccess = isSuperAdmin || (allowedRoles.length === 0) || allowedRoles.includes(userRole);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">
            Anda tidak memiliki izin untuk membuka halaman ini. Halaman ini hanya untuk peran{" "}
            <span className="font-semibold text-gray-800">{allowedRoles.join(" atau ")}</span>.
          </p>
          <div className="space-y-3">
            <Link
              href={
                userRole === "staf"
                  ? "/staf"
                  : userRole === "tutor"
                  ? "/tutor"
                  : userRole === "super_admin"
                  ? "/admin"
                  : "/beranda"
              }
              className="inline-flex items-center justify-center w-full bg-[#EA580C] text-white py-2.5 rounded-xl font-medium hover:bg-[#c2410c] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Halaman Utama Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
