"use client";

import React, { useEffect, useState, use } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Check, AlertCircle, ShieldAlert } from "lucide-react";

export default function PeriksaTugasTutorPage({ params }) {
  const unwrappedParams = use(params);
  const tugasId = unwrappedParams.id;

  const { user, profile } = useAuth();
  const [tugas, setTugas] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [pengumpulanList, setPengumpulanList] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Penilaian Modal
  const [gradingItem, setGradingItem] = useState(null);
  const [inputNilai, setInputNilai] = useState("");
  const [inputKomentar, setInputKomentar] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  const loadData = async () => {
    if (!user || !tugasId) return;
    try {
      const snapTugas = await getDoc(doc(db, "tugas", tugasId));
      if (!snapTugas.exists()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const tData = { id: snapTugas.id, ...snapTugas.data() };
      setTugas(tData);

      // Cek kelas pengampu
      const snapK = await getDoc(doc(db, "kelas", tData.kelasId));
      if (!snapK.exists()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const kData = { id: snapK.id, ...snapK.data() };
      setKelas(kData);

      // Hanya tutor kelas itu dan Super Admin yang berhak (PRD 4.13)
      const isSuperAdmin = profile?.role === "super_admin";
      if (!isSuperAdmin && kData.tutorId !== user.uid) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Ambil nama seluruh siswa di kelas
      const sIds = kData.siswaIds || [];
      const uMap = {};
      if (sIds.length > 0) {
        const snapAllUsers = await getDocs(collection(db, "users"));
        snapAllUsers.docs.forEach(d => {
          if (sIds.includes(d.id)) {
            uMap[d.id] = d.data().nama;
          }
        });
      }
      setStudentsMap(uMap);

      // Ambil seluruh pengumpulan untuk tugas ini
      const qPengumpulan = query(collection(db, "pengumpulan"), where("tugasId", "==", tugasId));
      const snapP = await getDocs(qPengumpulan);
      setPengumpulanList(snapP.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile, tugasId]);

  const openGradeModal = (item) => {
    setGradingItem(item);
    setInputNilai(item.nilai !== null && item.nilai !== undefined ? String(item.nilai) : "");
    setInputKomentar(item.komentar || "");
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    const val = parseInt(inputNilai, 10);
    if (isNaN(val) || val < 0 || val > 100) {
      alert("Nilai harus berupa bilangan bulat antara 0 sampai 100.");
      return;
    }

    setSavingGrade(true);
    try {
      await updateDoc(doc(db, "pengumpulan", gradingItem.id), {
        nilai: val,
        komentar: inputKomentar.trim(),
      });
      setGradingItem(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan nilai.");
    } finally {
      setSavingGrade(false);
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={["tutor", "super_admin"]}>
        <Navbar />
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </RouteGuard>
    );
  }

  if (accessDenied || !tugas) {
    return (
      <RouteGuard allowedRoles={["tutor", "super_admin"]}>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
            <p className="text-gray-500 text-sm mb-6">
              Anda tidak memiliki hak memeriksa tugas dari kelas yang diajar tutor lain.
            </p>
            <Link
              href="/tutor"
              className="inline-flex items-center px-4 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dasbor Tutor
            </Link>
          </div>
        </main>
      </RouteGuard>
    );
  }

  const sIds = kelas?.siswaIds || [];

  return (
    <RouteGuard allowedRoles={["tutor", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/tutor/kelas/${kelas.id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Kelas
        </Link>

        {/* Info Header Tugas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 uppercase tracking-wider">
            Evaluasi & Penilaian Tugas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">
            {tugas.judul}
          </h1>
          <p className="text-sm text-gray-600 mb-2">{kelas.nama}</p>
          <p className="text-xs text-gray-400 font-mono">
            Batas Waktu: {tugas.batasWaktu?.toDate ? tugas.batasWaktu.toDate().toLocaleString("id-ID") : "Sesuai Jadwal"}
          </p>
        </div>

        {/* Tabel Pengumpulan Siswa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Daftar Jawaban Siswa ({pengumpulanList.length}/{sIds.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-xl">Nama Siswa</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Waktu Kumpul</th>
                  <th className="px-4 py-3.5">Tautan Jawaban</th>
                  <th className="px-4 py-3.5 text-center">Nilai</th>
                  <th className="px-4 py-3.5">Komentar</th>
                  <th className="px-4 py-3.5 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sIds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                      Belum ada siswa yang dimasukkan ke kelas ini.
                    </td>
                  </tr>
                ) : (
                  sIds.map((uid) => {
                    const studentName = studentsMap[uid] || uid;
                    const p = pengumpulanList.find(item => item.siswaId === uid);
                    const isSubmitted = !!p;
                    const isGraded = p && p.nilai !== null && p.nilai !== undefined;

                    return (
                      <tr key={uid} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 font-bold text-gray-900">{studentName}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isGraded
                              ? "bg-emerald-100 text-emerald-800"
                              : isSubmitted
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {isGraded ? "Dinilai" : isSubmitted ? "Dikumpulkan" : "Belum Kumpul"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-mono text-gray-500">
                          {p?.dikumpulkanPada?.toDate ? p.dikumpulkanPada.toDate().toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="px-4 py-4">
                          {p?.tautan ? (
                            <a
                              href={p.tautan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-[#EA580C] hover:underline font-medium"
                            >
                              <span>Buka File</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs italic">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-gray-900 font-mono">
                          {isGraded ? p.nilai : "-"}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500 max-w-xs truncate">
                          {p?.komentar || "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {isSubmitted && (
                            <button
                              onClick={() => openGradeModal(p)}
                              className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-lg text-xs font-semibold transition"
                            >
                              {isGraded ? "Ubah Nilai" : "Beri Nilai"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Beri Nilai */}
        {gradingItem && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Penilaian Tugas</h3>
              <p className="text-xs text-gray-500 mb-4">
                Siswa: <strong className="text-gray-800">{studentsMap[gradingItem.siswaId]}</strong>
              </p>

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nilai Angka (0 - 100)*
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={inputNilai}
                    onChange={(e) => setInputNilai(e.target.value)}
                    placeholder="Contoh: 85"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Komentar / Feedback Tutor
                  </label>
                  <textarea
                    rows={3}
                    value={inputKomentar}
                    onChange={(e) => setInputKomentar(e.target.value)}
                    placeholder="Tuliskan masukan untuk siswa..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGradingItem(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingGrade}
                    className="px-5 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
                  >
                    {savingGrade ? "Menyimpan..." : "Simpan Nilai"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </RouteGuard>
  );
}
