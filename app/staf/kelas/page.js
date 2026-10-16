"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import Link from "next/link";
import { FolderPlus, Users, Calendar, Clock, MapPin, ArrowRight, Plus } from "lucide-react";

export default function KelolaKelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Buat Kelas
  const [showModal, setShowModal] = useState(false);
  const [namaKelas, setNamaKelas] = useState("");
  const [programId, setProgramId] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [hari, setHari] = useState("Senin");
  const [jam, setJam] = useState("16.00");
  const [tempat, setTempat] = useState("Ruang 1");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const snapK = await getDocs(collection(db, "kelas"));
      setKelasList(snapK.docs.map(d => ({ id: d.id, ...d.data() })));

      const snapP = await getDocs(collection(db, "program"));
      const pList = snapP.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrograms(pList);
      if (pList.length > 0 && !programId) setProgramId(pList[0].id);

      // Ambil user yang berperan "tutor"
      const qTutor = query(collection(db, "users"), where("role", "==", "tutor"));
      const snapT = await getDocs(qTutor);
      const tList = snapT.docs.map(d => ({ id: d.id, ...d.data() }));
      setTutors(tList);
      if (tList.length > 0 && !tutorId) setTutorId(tList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateKelas = async (e) => {
    e.preventDefault();
    if (!tutorId) {
      alert("Pilih tutor pengampu terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "kelas"), {
        nama: namaKelas,
        programId: programId,
        tutorId: tutorId,
        siswaIds: [],
        hari: hari,
        jam: jam,
        tempat: tempat,
      });
      setShowModal(false);
      setNamaKelas("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat kelas.");
    } finally {
      setSubmitting(false);
    }
  };

  const programsMap = {};
  programs.forEach(p => { programsMap[p.id] = p.nama; });

  const tutorsMap = {};
  tutors.forEach(t => { tutorsMap[t.id] = t.nama; });

  return (
    <RouteGuard allowedRoles={["staf", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Kelola Kelas Belajar
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atur jadwal kelas bimbingan, tentukan tutor, dan masukkan siswa ke dalam kelas.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Kelas Baru
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3.5 rounded-l-xl">Nama Kelas</th>
                    <th className="px-4 py-3.5">Program</th>
                    <th className="px-4 py-3.5">Tutor</th>
                    <th className="px-4 py-3.5">Jadwal & Tempat</th>
                    <th className="px-4 py-3.5 text-center">Jumlah Siswa</th>
                    <th className="px-4 py-3.5 text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kelasList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        Belum ada kelas yang dibuat. Silakan klik tombol Buat Kelas Baru.
                      </td>
                    </tr>
                  ) : (
                    kelasList.map((k) => (
                      <tr key={k.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 font-bold text-gray-900">
                          {k.nama}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700">
                          {programsMap[k.programId] || k.programId}
                        </td>
                        <td className="px-4 py-4 text-gray-800">
                          {tutorsMap[k.tutorId] || "Tutor Belum Dipilih"}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {k.hari}, {k.jam} · {k.tempat}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-gray-800">
                          {(k.siswaIds || []).length}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/staf/kelas/${k.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#EA580C] rounded-lg text-xs font-semibold transition"
                          >
                            <span>Atur Siswa</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Buat Kelas */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Buat Kelas Baru</h3>
              <p className="text-xs text-gray-500 mb-6">
                Pastikan program dan tutor pengampu sudah ditentukan dengan tepat.
              </p>

              <form onSubmit={handleCreateKelas} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nama Kelas*
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKelas}
                    onChange={(e) => setNamaKelas(e.target.value)}
                    placeholder="Contoh: Intensif UTBK A"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Program*
                    </label>
                    <select
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white"
                    >
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Tutor Pengampu*
                    </label>
                    <select
                      value={tutorId}
                      onChange={(e) => setTutorId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white"
                    >
                      {tutors.length === 0 ? (
                        <option value="">(Belum ada akun Tutor)</option>
                      ) : (
                        tutors.map(t => (
                          <option key={t.id} value={t.id}>{t.nama}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Hari*
                    </label>
                    <select
                      value={hari}
                      onChange={(e) => setHari(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    >
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Jam*
                    </label>
                    <input
                      type="text"
                      required
                      value={jam}
                      onChange={(e) => setJam(e.target.value)}
                      placeholder="16.00 - 17.30"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Tempat*
                    </label>
                    <input
                      type="text"
                      required
                      value={tempat}
                      onChange={(e) => setTempat(e.target.value)}
                      placeholder="Ruang 1 / Zoom"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Kelas"}
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
