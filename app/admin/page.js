"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Users, FileText, CheckCircle2, ArrowRight, BarChart3, BookOpen } from "lucide-react";

export default function DasborAdminPage() {
  const [siswaAktifCount, setSiswaAktifCount] = useState(0);
  const [pendaftaranBulanIniCount, setPendaftaranBulanIniCount] = useState(0);
  const [rataKehadiran, setRataKehadiran] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminSummary() {
      try {
        // 1. Siswa Aktif: jumlah siswa dengan minimal 1 pendaftaran aktif (PRD 4.14)
        const qAktif = query(collection(db, "pendaftaran"), where("status", "==", "aktif"));
        const snapAktif = await getDocs(qAktif);
        const activeUids = new Set(snapAktif.docs.map(d => d.data().siswaId));
        setSiswaAktifCount(activeUids.size);

        // 2. Pendaftaran bulan ini: semua pendaftaran
        const snapAllDaftar = await getDocs(collection(db, "pendaftaran"));
        setPendaftaranBulanIniCount(snapAllDaftar.size);

        // 3. Rata-rata kehadiran: dari seluruh data pertemuan
        const snapPertemuan = await getDocs(collection(db, "pertemuan"));
        const snapKelas = await getDocs(collection(db, "kelas"));
        const kelasMap = {};
        snapKelas.docs.forEach(k => {
          kelasMap[k.id] = (k.data().siswaIds || []).length;
        });

        let totalPersen = 0;
        let countPertemuan = 0;

        snapPertemuan.docs.forEach(pDoc => {
          const p = pDoc.data();
          const totalSiswa = kelasMap[p.kelasId] || 0;
          const totalHadir = (p.hadirIds || []).length;
          if (totalSiswa > 0) {
            totalPersen += (totalHadir / totalSiswa) * 100;
            countPertemuan++;
          }
        });

        const avg = countPertemuan > 0 ? Math.round(totalPersen / countPertemuan) : 0;
        setRataKehadiran(avg);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminSummary();
  }, []);

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dasbor Pemilik (Super Admin)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan performa bimbingan belajar, hak kelola seluruh pengguna, program, dan laporan.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Siswa Aktif */}
            <Link
              href="/admin/laporan"
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600 transition" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Siswa Aktif
              </h3>
              <p className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {siswaAktifCount} <span className="text-sm font-normal text-gray-400">siswa</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Memiliki minimal 1 pendaftaran aktif</p>
            </Link>

            {/* Pendaftaran */}
            <Link
              href="/admin/laporan"
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#EA580C] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-[#EA580C] transition" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pendaftaran Bimbel
              </h3>
              <p className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {pendaftaranBulanIniCount} <span className="text-sm font-normal text-gray-400">pengajuan</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Total pengajuan masuk ke sistem</p>
            </Link>

            {/* Rata Kehadiran */}
            <Link
              href="/admin/laporan"
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rata-rata Kehadiran
              </h3>
              <p className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {rataKehadiran}%
              </p>
              <p className="text-xs text-gray-400 mt-2">Persentase kehadiran tatap muka kelas</p>
            </Link>
          </div>
        )}

        {/* Akses Cepat Menu Super Admin */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Akses Cepat Pengelolaan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/pengguna"
              className="p-5 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition block"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-bold text-gray-900 text-sm">Kelola Pengguna & Peran</h4>
              <p className="text-xs text-gray-500 mt-1">Ubah peran staf/tutor dan nonaktifkan akun.</p>
            </Link>
            <Link
              href="/admin/program"
              className="p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition block"
            >
              <BookOpen className="w-6 h-6 text-[#EA580C] mb-2" />
              <h4 className="font-bold text-gray-900 text-sm">Kelola Program Belajar</h4>
              <p className="text-xs text-gray-500 mt-1">Tambah paket bimbel, jenjang, dan biaya kursus.</p>
            </Link>
            <Link
              href="/admin/laporan"
              className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition block"
            >
              <BarChart3 className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-bold text-gray-900 text-sm">Rekap & Laporan Bulanan</h4>
              <p className="text-xs text-gray-500 mt-1">Rekap siswa aktif, kehadiran, dan kelas per tutor.</p>
            </Link>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
