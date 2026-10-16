"use client";

import React, { useEffect, useState, use } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { FileText, Calendar, Send, CheckCircle2, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";

export default function DetailTugasPage({ params }) {
  const unwrappedParams = use(params);
  const tugasId = unwrappedParams.id;

  const { user, profile } = useAuth();
  const [tugas, setTugas] = useState(null);
  const [pengumpulan, setPengumpulan] = useState(null);
  const [tautan, setTautan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [msg, setMsg] = useState("");

  const loadTugasData = async () => {
    if (!user || !tugasId) return;
    try {
      const docRef = doc(db, "tugas", tugasId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        setErrorNotFound(true);
        setLoading(false);
        return;
      }

      const tugasData = snap.data();

      // Cek apakah siswa berhak (anggota kelas, tutor kelas, atau staf/admin)
      const kelasSnap = await getDoc(doc(db, "kelas", tugasData.kelasId));
      if (!kelasSnap.exists()) {
        setErrorNotFound(true);
        setLoading(false);
        return;
      }

      const kelasData = kelasSnap.data();
      const userRole = profile?.role || "siswa";
      const isMember = (kelasData.siswaIds || []).includes(user.uid);
      const isTutorOfClass = kelasData.tutorId === user.uid;
      const isStaffOrAdmin = userRole === "staf" || userRole === "super_admin";

      if (!isMember && !isTutorOfClass && !isStaffOrAdmin) {
        setErrorNotFound(true);
        setLoading(false);
        return;
      }

      setTugas({ id: snap.id, ...tugasData });

      // Cek pengumpulan siswa ini (Nilai dan jawaban siswa lain tidak tampil!)
      const qPengumpulan = query(
        collection(db, "pengumpulan"),
        where("tugasId", "==", tugasId),
        where("siswaId", "==", user.uid)
      );
      const snapPengumpulan = await getDocs(qPengumpulan);
      if (!snapPengumpulan.empty) {
        const pDoc = snapPengumpulan.docs[0];
        const pData = { id: pDoc.id, ...pDoc.data() };
        setPengumpulan(pData);
        setTautan(pData.tautan || "");
      }
    } catch (err) {
      console.error(err);
      setErrorNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTugasData();
  }, [user, profile, tugasId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tautan.startsWith("https://")) {
      alert("Tautan wajib diawali dengan https:// (misal tautan Google Drive / Docs)");
      return;
    }

    setSubmitting(true);
    setMsg("");
    try {
      if (pengumpulan) {
        // Update tautan pengumpulan
        await updateDoc(doc(db, "pengumpulan", pengumpulan.id), {
          tautan: tautan,
          dikumpulkanPada: serverTimestamp(),
        });
      } else {
        // Buat pengumpulan baru
        await addDoc(collection(db, "pengumpulan"), {
          tugasId: tugasId,
          siswaId: user.uid,
          kelasId: tugas.kelasId,
          tautan: tautan,
          dikumpulkanPada: serverTimestamp(),
          nilai: null,
          komentar: "",
        });
      }
      setMsg("Jawaban tugas berhasil dikumpulkan!");
      await loadTugasData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengumpulkan tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  // Status tugas dihitung sesuai PRD 4.5:
  // - Dinilai: tutor sudah mengisi nilai
  // - Dikumpulkan: tautan terkirim, belum dinilai
  // - Belum dikumpulkan / Terlambat
  const getStatus = () => {
    if (!tugas) return "";
    if (pengumpulan && pengumpulan.nilai !== null && pengumpulan.nilai !== undefined) {
      return "Dinilai";
    }
    if (pengumpulan && pengumpulan.tautan) {
      return "Dikumpulkan";
    }
    const batas = tugas.batasWaktu?.toDate ? tugas.batasWaktu.toDate() : null;
    if (batas && new Date() > batas) {
      return "Terlambat";
    }
    return "Belum dikumpulkan";
  };

  const status = getStatus();

  const statusBadge = {
    "Belum dikumpulkan": "bg-gray-100 text-gray-700",
    "Dikumpulkan": "bg-amber-100 text-amber-800",
    "Dinilai": "bg-emerald-100 text-emerald-800",
    "Terlambat": "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={["siswa", "super_admin", "tutor"]}>
        <Navbar />
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </RouteGuard>
    );
  }

  if (errorNotFound || !tugas) {
    return (
      <RouteGuard allowedRoles={["siswa", "super_admin", "tutor"]}>
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Tugas Tidak Ditemukan</h1>
            <p className="text-gray-500 text-sm mb-6">
              Tugas ini tidak tersedia atau Anda tidak terdaftar di kelas tugas ini.
            </p>
            <Link
              href="/beranda"
              className="inline-flex items-center px-4 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        </main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["siswa", "super_admin", "tutor"]}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/kelas/${tugas.kelasId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Rincian Kelas
        </Link>

        {msg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[status]}`}>
              Status: {status}
            </span>
            <div className="flex items-center text-xs text-gray-500 font-mono">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              Batas Waktu: {tugas.batasWaktu?.toDate ? tugas.batasWaktu.toDate().toLocaleString("id-ID") : "Sesuai Jadwal"}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
            {tugas.judul}
          </h1>

          <div className="prose max-w-none text-gray-700 text-sm whitespace-pre-line mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {tugas.deskripsi}
          </div>

          {/* Kartu Nilai & Komentar (Bila sudah dinilai) */}
          {pengumpulan && pengumpulan.nilai !== null && pengumpulan.nilai !== undefined && (
            <div className="mb-8 p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Hasil Penilaian Tutor</span>
                <span className="text-3xl font-black text-emerald-700 font-mono">
                  {pengumpulan.nilai} <span className="text-base text-emerald-600 font-normal">/ 100</span>
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-2 font-medium">Catatan & Komentar Tutor:</p>
              <p className="text-sm text-emerald-800 mt-1 italic bg-white/80 p-3 rounded-lg border border-emerald-100">
                "{pengumpulan.komentar || "Bagus, pertahankan prestasimu!"}"
              </p>
            </div>
          )}

          {/* Form Pengumpulan Jawaban */}
          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Pengumpulan Jawaban</h2>
            <p className="text-xs text-gray-500 mb-4">
              Cantumkan tautan penyimpanan berkas tugas Anda (contoh Google Drive / Docs / Cloud). Pastikan akses tautan dapat dibuka publik/tutor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tautan Jawaban (URL)*
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={tautan}
                    onChange={(e) => setTautan(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    disabled={status === "Dinilai"}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {status !== "Dinilai" ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-70"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Menyimpan..." : pengumpulan ? "Perbarui Tautan Jawaban" : "Kumpulkan Tugas"}
                </button>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Tugas ini sudah dinilai oleh tutor dan tidak dapat diubah lagi.
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
