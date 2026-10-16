"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, ArrowRight } from "lucide-react";

export default function KelasSayaPage() {
  const { user } = useAuth();
  const [kelasList, setKelasList] = useState([]);
  const [tutorNames, setTutorNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKelas() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "kelas"),
          where("siswaIds", "array-contains", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setKelasList(list);

        // Ambil nama tutor
        const tutorUids = [...new Set(list.map(k => k.tutorId).filter(Boolean))];
        if (tutorUids.length > 0) {
          const qUsers = query(collection(db, "users"), where("__name__", "in", tutorUids.slice(0, 10)));
          const snapUsers = await getDocs(qUsers);
          const map = {};
          snapUsers.docs.forEach(d => {
            map[d.id] = d.data().nama;
          });
          setTutorNames(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchKelas();
  }, [user]);

  return (
    <RouteGuard allowedRoles={["siswa", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Kelas Saya
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Daftar kelas aktif yang sedang Anda ikuti di Bimbingan Belajar Langkah Juara.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : kelasList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Belum ada kelas yang diikuti</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Setelah pendaftaran programmu disetujui staf, staf akan memasukkanmu ke dalam kelas.
            </p>
            <Link
              href="/program"
              className="inline-flex items-center px-5 py-2.5 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition shadow-sm"
            >
              Lihat Program Belajar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kelasList.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{k.nama}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      Tutor: <span className="font-semibold text-gray-800 ml-1">{tutorNames[k.tutorId] || "Tutor Bimbel"}</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {k.hari}, {k.jam}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {k.tempat}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/kelas/${k.id}`}
                  className="flex items-center justify-center w-full bg-orange-50 hover:bg-orange-100 text-[#EA580C] py-2.5 rounded-xl text-sm font-semibold transition group"
                >
                  <span>Buka Rincian Kelas</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </RouteGuard>
  );
}
