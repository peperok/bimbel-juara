"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      const role = profile.role || "siswa";
      if (role === "staf") router.push("/staf");
      else if (role === "tutor") router.push("/tutor");
      else if (role === "super_admin") router.push("/admin");
      else router.push("/beranda");
    }
  }, [user, profile, loading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-[#EA580C] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-orange-500/20">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Langkah Juara
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Portal Bimbingan Belajar SMP & SMA. Akses jadwal kelas, materi, dan pengumpulan tugas dalam satu pintu.
        </p>

        <div className="space-y-3">
          <Link
            href="/masuk"
            className="flex items-center justify-center w-full bg-[#EA580C] hover:bg-[#c2410c] text-white font-semibold py-3 px-6 rounded-xl transition duration-150 shadow-sm group"
          >
            <span>Masuk ke Akun</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            href="/daftar"
            className="flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition duration-150"
          >
            Daftar Akun Siswa Baru
          </Link>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-8">
        &copy; 2026 Bimbel Langkah Juara · Makassar
      </p>
    </main>
  );
}
