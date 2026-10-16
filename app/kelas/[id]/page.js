"use client";

import React, { useEffect, useState, use } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, FileText, ExternalLink, ArrowLeft, AlertCircle } from "lucide-react";

export default function RincianKelasPage({ params }) {
  const unwrappedParams = use(params);
  const kelasId = unwrappedParams.id;

  const { user, profile } = useAuth();
  const [kelas, setKelas] = useState(null);
  const [pertemuanList, setPertemuanList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [tutorName, setTutorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!user || !kelasId) return;
      try {
        const docRef = doc(db, "kelas", kelasId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setErrorNotFound(true);
          setLoading(false);
          return;
        }

        const data = snap.data();
        const userRole = profile?.role || "siswa";

        // Siswa hanya boleh buka jika ada di siswaIds, kecuali staf / super_admin / tutor kelas
        const isMember = (data.siswaIds || []).includes(user.uid);
        const isTutorOfClass = data.tutorId === user.uid;
        const isStaffOrAdmin = userRole === "staf" || userRole === "super_admin";

        if (!isMember && !isTutorOfClass && !isStaffOrAdmin) {
          setErrorNotFound(true);
          setLoading(false);
          return;
        }

        setKelas({ id: snap.id, ...data });

        // Ambil nama tutor
        if (data.tutorId) {
          const tutorSnap = await getDoc(doc(db, "users", data.tutorId));
          if (tutorSnap.exists()) setTutorName(tutorSnap.data().nama);
        }

        // Ambil pertemuan
        const qPertemuan = query(collection(db, "pertemuan"), where("kelasId", "==", kelasId));
        const snapP = await getDocs(qPertemuan);
        setPertemuanList(snapP.docs.map(d => ({ id: d.id, ...d.data() })));

        // Ambil tugas
        const qTugas = query(collection(db, "tugas"), where("kelasId", "==", kelasId));
        const snapT = await getDocs(qTugas);
        setTugasList(snapT.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setErrorNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [user, profile, kelasId]);

  if (loading) {
    return (
      <RouteGuard allowedRoles={["siswa", "staf", "tutor", "super_admin"]}>
        <Navbar />
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </RouteGuard>
    );
  }

  if (errorNotFound || !kelas) {
    return (
      <RouteGuard allowedRoles={["siswa", "staf", "tutor", "super_admin"]}>
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Kelas Tidak Ditemukan</h1>
            <p className="text-gray-500 text-sm mb-6">
              Anda tidak terdaftar di kelas ini atau ID kelas tidak valid.
            </p>
            <Link
              href="/kelas"
              className="inline-flex items-center px-4 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Kelas Saya
            </Link>
          </div>
        </main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["siswa", "staf", "tutor", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/kelas" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Kelas
          </Link>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-50 text-[#EA580C] uppercase tracking-wider">
              Rincian Kelas
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-4">
              {kelas.nama}
            </h1>
            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1.5 text-gray-400" />
                Tutor: <strong className="ml-1 text-gray-800">{tutorName || "Tutor Bimbel"}</strong>
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                {kelas.hari}, {kelas.jam}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                {kelas.tempat}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daftar Pertemuan & Materi */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Calendar className="w-5 h-5 text-[#EA580C] mr-2" />
              Pertemuan & Materi
            </h2>

            {pertemuanList.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Belum ada pertemuan yang dijadwalkan.</p>
            ) : (
              <div className="space-y-4">
                {pertemuanList.map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 font-mono">
                          Pertemuan #{idx + 1} · {p.tanggal}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-0.5">{p.topik}</h4>
                      </div>
                      {p.materiUrl ? (
                        <a
                          href={p.materiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-white hover:bg-orange-50 border border-gray-200 text-[#EA580C] rounded-lg text-xs font-semibold transition"
                        >
                          <span>Materi</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tanpa berkas</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daftar Tugas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <FileText className="w-5 h-5 text-amber-500 mr-2" />
              Daftar Tugas Kelas
            </h2>

            {tugasList.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Belum ada tugas untuk kelas ini.</p>
            ) : (
              <div className="space-y-3">
                {tugasList.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tugas/${t.id}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-800 transition">
                        {t.judul}
                      </h4>
                      <span className="text-xs text-[#EA580C] font-semibold group-hover:underline">
                        Buka Tugas &rarr;
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.deskripsi}</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Batas Waktu: {t.batasWaktu?.toDate ? t.batasWaktu.toDate().toLocaleDateString("id-ID") : "Sesuai Jadwal"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
