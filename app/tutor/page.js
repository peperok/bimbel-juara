"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, BookOpen, Users } from "lucide-react";

export default function DasborTutorPage() {
  const { user } = useAuth();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutorClasses() {
      if (!user) return;
      try {
        // Hanya kelas yang diajar oleh tutor ini (tutorId == user.uid)
        const q = query(collection(db, "kelas"), where("tutorId", "==", user.uid));
        const snap = await getDocs(q);
        setKelasList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTutorClasses();
  }, [user]);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayDay = days[new Date().getDay()];
  const kelasHariIni = kelasList.filter(k => k.hari?.toLowerCase() === todayDay.toLowerCase());

  return (
    <RouteGuard allowedRoles={["tutor", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dasbor Pengajar (Tutor)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola pertemuan tatap muka, tautan materi, presensi siswa, dan evaluasi tugas kelas Anda.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Kartu Kelas Hari Ini */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
                <Calendar className="w-5 h-5 text-[#EA580C]" />
                <h2 className="text-lg font-bold text-gray-900">
                  Kelas Hari Ini ({todayDay})
                </h2>
              </div>

              {kelasHariIni.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">Tidak ada jadwal kelas mengajar untuk hari ini.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kelasHariIni.map((k) => (
                    <div key={k.id} className="p-4 rounded-2xl border border-orange-200 bg-orange-50/30 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">{k.nama}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {k.jam} · {k.tempat}
                        </p>
                      </div>
                      <Link
                        href={`/tutor/kelas/${k.id}`}
                        className="px-4 py-2 bg-[#EA580C] text-white rounded-xl text-xs font-semibold hover:bg-[#c2410c] transition shadow-sm"
                      >
                        Buka Kelas
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Semua Kelas yang Diajar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-gray-100">
                <BookOpen className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Semua Kelas yang Saya Ajar</h2>
              </div>

              {kelasList.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">
                  Anda belum ditugaskan mengajar kelas mana pun oleh staf.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kelasList.map((k) => (
                    <div
                      key={k.id}
                      className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{k.nama}</h3>
                        <div className="space-y-1.5 text-xs text-gray-500 mb-6">
                          <p className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {k.hari}, {k.jam}
                          </p>
                          <p className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {k.tempat}
                          </p>
                          <p className="flex items-center">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {(k.siswaIds || []).length} Siswa Terdaftar
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/tutor/kelas/${k.id}`}
                        className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition"
                      >
                        <span>Kelola Pertemuan & Tugas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
