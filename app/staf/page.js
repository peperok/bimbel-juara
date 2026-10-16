"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { ClipboardList, Calendar, Users, ArrowRight, Clock } from "lucide-react";

export default function DasborStafPage() {
  const [pendaftaranMenungguCount, setPendaftaranMenungguCount] = useState(0);
  const [kelasHariIni, setKelasHariIni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStafData() {
      try {
        // 1. Hitung pendaftaran menunggu
        const qDaftar = query(collection(db, "pendaftaran"), where("status", "==", "menunggu"));
        const snapDaftar = await getDocs(qDaftar);
        setPendaftaranMenungguCount(snapDaftar.size);

        // 2. Kelas hari ini
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const todayDay = days[new Date().getDay()];

        const qKelas = query(collection(db, "kelas"));
        const snapKelas = await getDocs(qKelas);
        const allKelas = snapKelas.docs.map(d => ({ id: d.id, ...d.data() }));

        // Tampilkan kelas hari ini (atau semua kelas bila hari ini tidak ada)
        const todayKelas = allKelas.filter(k => k.hari?.toLowerCase() === todayDay.toLowerCase());
        setKelasHariIni(todayKelas.length > 0 ? todayKelas : allKelas.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStafData();
  }, []);

  return (
    <RouteGuard allowedRoles={["staf", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dasbor Staf Administrasi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Pantau permohonan pendaftaran program dan kelola kegiatan bimbingan belajar Langkah Juara.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Kartu Pendaftaran Menunggu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    Perlu Tindakan
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Pendaftaran Menunggu Konfirmasi
                </h3>
                <p className="text-5xl font-black text-gray-900 mt-2 font-mono">
                  {pendaftaranMenungguCount}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Calon siswa yang menunggu verifikasi pembayaran di kantor.
                </p>
              </div>

              <Link
                href="/staf/pendaftaran?status=menunggu"
                className="mt-6 flex items-center justify-between px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition group shadow-sm"
              >
                <span>Buka Antrean Pendaftaran</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Kartu Kelas Hari Ini */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#EA580C]" />
                  <h3 className="text-lg font-bold text-gray-900">Jadwal Kelas Aktif</h3>
                </div>
                <Link href="/staf/kelas" className="text-xs font-semibold text-[#EA580C] hover:underline">
                  Kelola Kelas
                </Link>
              </div>

              {kelasHariIni.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">Belum ada kelas yang dibuat.</p>
              ) : (
                <div className="space-y-3">
                  {kelasHariIni.map((k) => (
                    <div key={k.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{k.nama}</h4>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {k.hari}, {k.jam} · {k.tempat}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-lg font-mono text-gray-600 font-medium">
                        {(k.siswaIds || []).length} Siswa
                      </span>
                    </div>
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
