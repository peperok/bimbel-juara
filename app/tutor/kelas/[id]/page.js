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
  addDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Plus, CheckSquare, Square, ExternalLink, ShieldAlert } from "lucide-react";

export default function RincianKelasTutorPage({ params }) {
  const unwrappedParams = use(params);
  const kelasId = unwrappedParams.id;

  const { user, profile } = useAuth();
  const [kelas, setKelas] = useState(null);
  const [students, setStudents] = useState([]);
  const [pertemuanList, setPertemuanList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Modal Pertemuan
  const [showPertemuanModal, setShowPertemuanModal] = useState(false);
  const [tanggal, setTanggal] = useState("");
  const [topik, setTopik] = useState("");
  const [materiUrl, setMateriUrl] = useState("");
  const [savingPertemuan, setSavingPertemuan] = useState(false);

  // Presensi State
  const [activePertemuanId, setActivePertemuanId] = useState(null);
  const [hadirIds, setHadirIds] = useState([]);
  const [savingPresensi, setSavingPresensi] = useState(false);

  // Modal Tugas
  const [showTugasModal, setShowTugasModal] = useState(false);
  const [judulTugas, setJudulTugas] = useState("");
  const [deskripsiTugas, setDeskripsiTugas] = useState("");
  const [batasWaktuDate, setBatasWaktuDate] = useState("");
  const [savingTugas, setSavingTugas] = useState(false);

  const loadData = async () => {
    if (!user || !kelasId) return;
    try {
      const snapK = await getDoc(doc(db, "kelas", kelasId));
      if (!snapK.exists()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const kData = { id: snapK.id, ...snapK.data() };
      
      // Validasi PRD 4.12: Bila tutor membuka kelas tutor lain -> Akses Ditolak!
      // Kecuali super_admin
      const isSuperAdmin = profile?.role === "super_admin";
      if (!isSuperAdmin && kData.tutorId !== user.uid) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setKelas(kData);

      // Ambil nama siswa di kelas
      const sIds = kData.siswaIds || [];
      if (sIds.length > 0) {
        const snapAllUsers = await getDocs(collection(db, "users"));
        const sList = snapAllUsers.docs
          .filter(d => sIds.includes(d.id))
          .map(d => ({ id: d.id, ...d.data() }));
        setStudents(sList);
      } else {
        setStudents([]);
      }

      // Ambil pertemuan
      const qP = query(collection(db, "pertemuan"), where("kelasId", "==", kelasId));
      const snapP = await getDocs(qP);
      const pList = snapP.docs.map(d => ({ id: d.id, ...d.data() }));
      setPertemuanList(pList);

      // Ambil tugas
      const qT = query(collection(db, "tugas"), where("kelasId", "==", kelasId));
      const snapT = await getDocs(qT);
      const tList = snapT.docs.map(d => ({ id: d.id, ...d.data() }));
      setTugasList(tList);
    } catch (err) {
      console.error(err);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile, kelasId]);

  // Handle Buat Pertemuan
  const handleCreatePertemuan = async (e) => {
    e.preventDefault();
    if (materiUrl && !materiUrl.startsWith("https://")) {
      alert("Tautan materi wajib diawali dengan https://");
      return;
    }

    setSavingPertemuan(true);
    try {
      await addDoc(collection(db, "pertemuan"), {
        kelasId: kelasId,
        tanggal: tanggal,
        topik: topik,
        materiUrl: materiUrl || "",
        hadirIds: [],
      });
      setShowPertemuanModal(false);
      setTanggal("");
      setTopik("");
      setMateriUrl("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat pertemuan.");
    } finally {
      setSavingPertemuan(false);
    }
  };

  // Buka Modal Presensi
  const openPresensi = (pertemuan) => {
    setActivePertemuanId(pertemuan.id);
    setHadirIds(pertemuan.hadirIds || []);
  };

  const toggleHadir = (uid) => {
    if (hadirIds.includes(uid)) {
      setHadirIds(hadirIds.filter(id => id !== uid));
    } else {
      setHadirIds([...hadirIds, uid]);
    }
  };

  const handleSavePresensi = async () => {
    setSavingPresensi(true);
    try {
      await updateDoc(doc(db, "pertemuan", activePertemuanId), {
        hadirIds: hadirIds,
      });
      setActivePertemuanId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan presensi.");
    } finally {
      setSavingPresensi(false);
    }
  };

  // Handle Buat Tugas
  const handleCreateTugas = async (e) => {
    e.preventDefault();
    setSavingTugas(true);
    try {
      await addDoc(collection(db, "tugas"), {
        kelasId: kelasId,
        judul: judulTugas,
        deskripsi: deskripsiTugas,
        batasWaktu: Timestamp.fromDate(new Date(batasWaktuDate)),
      });
      setShowTugasModal(false);
      setJudulTugas("");
      setDeskripsiTugas("");
      setBatasWaktuDate("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat tugas.");
    } finally {
      setSavingTugas(false);
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

  if (accessDenied || !kelas) {
    return (
      <RouteGuard allowedRoles={["tutor", "super_admin"]}>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
            <p className="text-gray-500 text-sm mb-6">
              Anda tidak mengajar di kelas ini. Anda hanya dapat membuka kelas yang Anda ampu sendiri.
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

  return (
    <RouteGuard allowedRoles={["tutor", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tutor" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Dasbor Tutor
        </Link>

        {/* Header Kelas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 uppercase tracking-wider">
              Kelas yang Saya Ajar
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{kelas.nama}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Jadwal: {kelas.hari}, {kelas.jam} · Tempat: {kelas.tempat} · {students.length} Siswa Terdaftar
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPertemuanModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4 mr-1 text-[#EA580C]" />
              Buat Pertemuan
            </button>
            <button
              onClick={() => setShowTugasModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Buat Tugas Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bagian Pertemuan & Presensi */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-5 h-5 text-[#EA580C] mr-2" />
                Pertemuan ({pertemuanList.length})
              </span>
            </h2>

            {pertemuanList.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                Belum ada pertemuan. Klik "Buat Pertemuan" untuk memulai.
              </p>
            ) : (
              <div className="space-y-4">
                {pertemuanList.map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-mono text-gray-400">
                          #{idx + 1} · {p.tanggal}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{p.topik}</h4>
                      </div>
                      <button
                        onClick={() => openPresensi(p)}
                        className="px-3 py-1 bg-white border border-gray-200 hover:border-emerald-300 text-emerald-700 rounded-lg text-xs font-semibold transition"
                      >
                        Presensi ({(p.hadirIds || []).length}/{students.length})
                      </button>
                    </div>

                    {p.materiUrl && (
                      <a
                        href={p.materiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-[#EA580C] hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Tautan Materi Belajar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian Tugas Kelas */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 text-amber-500 mr-2" />
                Tugas Kelas ({tugasList.length})
              </span>
            </h2>

            {tugasList.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                Belum ada tugas di kelas ini. Klik "Buat Tugas Baru" untuk menambahkan tugas.
              </p>
            ) : (
              <div className="space-y-3">
                {tugasList.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tutor/tugas/${t.id}`}
                    className="block p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-800 transition">
                        {t.judul}
                      </h4>
                      <span className="text-xs text-[#EA580C] font-semibold group-hover:underline">
                        Periksa & Beri Nilai &rarr;
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.deskripsi}</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Batas: {t.batasWaktu?.toDate ? t.batasWaktu.toDate().toLocaleString("id-ID") : "Sesuai Jadwal"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Buat Pertemuan */}
        {showPertemuanModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Buat Pertemuan Kelas</h3>
              <form onSubmit={handleCreatePertemuan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Tanggal Pertemuan*
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Topik Pembelajaran*
                  </label>
                  <input
                    type="text"
                    required
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: Persamaan Linear Satu Variabel"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Tautan Materi (Opsional)
                  </label>
                  <input
                    type="url"
                    value={materiUrl}
                    onChange={(e) => setMateriUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPertemuanModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingPertemuan}
                    className="px-5 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
                  >
                    {savingPertemuan ? "Menyimpan..." : "Simpan Pertemuan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Presensi */}
        {activePertemuanId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Presensi Kehadiran Siswa</h3>
              <p className="text-xs text-gray-500 mb-6">
                Centang nama siswa yang hadir pada pertemuan tatap muka ini.
              </p>

              {students.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Belum ada siswa di kelas ini.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
                  {students.map((s) => {
                    const isHadir = hadirIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleHadir(s.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          isHadir ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-bold text-sm text-gray-900">{s.nama}</span>
                        {isHadir ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActivePertemuanId(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSavePresensi}
                  disabled={savingPresensi}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  {savingPresensi ? "Menyimpan..." : "Simpan Presensi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Buat Tugas */}
        {showTugasModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Buat Tugas Baru</h3>
              <form onSubmit={handleCreateTugas} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Judul Tugas*
                  </label>
                  <input
                    type="text"
                    required
                    value={judulTugas}
                    onChange={(e) => setJudulTugas(e.target.value)}
                    placeholder="Contoh: Latihan Penalaran Umum 3"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Deskripsi / Petunjuk Pengerjaan*
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={deskripsiTugas}
                    onChange={(e) => setDeskripsiTugas(e.target.value)}
                    placeholder="Jelaskan instruksi tugas..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Batas Waktu Pengumpulan*
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={batasWaktuDate}
                    onChange={(e) => setBatasWaktuDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTugasModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingTugas}
                    className="px-5 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition"
                  >
                    {savingTugas ? "Menyimpan..." : "Simpan Tugas"}
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
