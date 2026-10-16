"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

export default function BerandaPage() {
  const { user, profile } = useAuth();
  const [kelasList, setKelasList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // Ambil kelas yang memuat uid siswa di array siswaIds
        const qKelas = query(
          collection(db, "kelas"),
          where("siswaIds", "array-contains", user.uid)
        );
        const snapKelas = await getDocs(qKelas);
        const kelasArr = snapKelas.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setKelasList(kelasArr);

        // Jika punya kelas, ambil tugas dari kelas-kelas tersebut
        if (kelasArr.length > 0) {
          const kelasIds = kelasArr.map(k => k.id);
          const qTugas = query(
            collection(db, "tugas"),
            where("kelasId", "in", kelasIds.slice(0, 10))
          );
          const snapTugas = await getDocs(qTugas);
          
          // Cek pengumpulan siswa
          const qPengumpulan = query(
            collection(db, "pengumpulan"),
            where("siswaId", "==", user.uid)
          );
          const snapPengumpulan = await getDocs(qPengumpulan);
          const kumpulTugasIds = snapPengumpulan.docs.map(d => d.data().tugasId);

          // Saring tugas yang BELUM dikumpulkan
          const belumKumpul = snapTugas.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(t => !kumpulTugasIds.includes(t.id));

          setTugasList(belumKumpul);
        }
      } catch (err) {
        console.error("Gagal memuat data beranda:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  return (
    <RouteGuard allowedRoles={["siswa", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Halo, {profile?.nama || "Siswa"}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Selamat datang di Portal Belajar Langkah Juara. Tetap semangat menggapai impian!
            </p>
          </div>
          <Link
            href="/program"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Lihat Program Bimbel
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kartu: Kelas Berikutnya */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#EA580C]" />
                  <h2 className="text-lg font-bold text-gray-900">Jadwal Kelas Saya</h2>
                </div>
                <Link href="/kelas" className="text-xs font-semibold text-[#EA580C] hover:underline flex items-center">
                  Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {kelasList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">Anda belum terdaftar di kelas mana pun.</p>
                  <Link
                    href="/program"
                    className="inline-flex items-center px-4 py-2 border border-[#EA580C] text-[#EA580C] hover:bg-orange-50 rounded-xl text-sm font-medium transition"
                  >
                    Daftar Program Sekarang
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {kelasList.map((k) => (
                    <Link
                      key={k.id}
                      href={`/kelas/${k.id}`}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition group"
                    >
                      <h3 className="font-bold text-gray-900 group-hover:text-[#EA580C] transition">
                        {k.nama}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {k.hari}, {k.jam}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {k.tempat}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Kartu: Tugas Belum Dikumpulkan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900">Tugas Belum Dikumpulkan</h2>
                </div>
              </div>

              {tugasList.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                  <p className="text-gray-700 font-medium text-sm">Semua tugas beres!</p>
                  <p className="text-gray-400 text-xs mt-1">Tidak ada tugas tertunda untuk saat ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tugasList.map((t) => (
                    <Link
                      key={t.id}
                      href={`/tugas/${t.id}`}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition group"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition">
                          {t.judul}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          Belum Kumpul
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.deskripsi}</p>
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        Batas: {t.batasWaktu?.toDate ? t.batasWaktu.toDate().toLocaleDateString("id-ID") : "Segera"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </RouteGuard>
  );
}
