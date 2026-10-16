"use client";

import React, { useEffect, useState, use } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, UserPlus, Trash2, CheckCircle, AlertCircle, Users } from "lucide-react";

export default function RincianKelasStafPage({ params }) {
  const unwrappedParams = use(params);
  const kelasId = unwrappedParams.id;

  const [kelas, setKelas] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!kelasId) return;
    try {
      const snapK = await getDoc(doc(db, "kelas", kelasId));
      if (!snapK.exists()) {
        setKelas(null);
        setLoading(false);
        return;
      }

      const kData = { id: snapK.id, ...snapK.data() };
      setKelas(kData);

      // Ambil profil siswa yang sudah ada di kelas
      const sIds = kData.siswaIds || [];
      if (sIds.length > 0) {
        const snapUsers = await getDocs(collection(db, "users"));
        const enrolled = snapUsers.docs
          .filter(d => sIds.includes(d.id))
          .map(d => ({ id: d.id, ...d.data() }));
        setEnrolledStudents(enrolled);
      } else {
        setEnrolledStudents([]);
      }

      // Ambil siswa yang punya pendaftaran AKTIF untuk program kelas ini (PRD 4.9)
      const qPendaftaran = query(
        collection(db, "pendaftaran"),
        where("programId", "==", kData.programId),
        where("status", "==", "aktif")
      );
      const snapP = await getDocs(qPendaftaran);
      const activeSiswaUids = [...new Set(snapP.docs.map(d => d.data().siswaId))];

      // Filter siswa aktif yang belum masuk di kelas ini
      const unassignedUids = activeSiswaUids.filter(uid => !sIds.includes(uid));

      if (unassignedUids.length > 0) {
        const snapAllUsers = await getDocs(collection(db, "users"));
        const eligible = snapAllUsers.docs
          .filter(d => unassignedUids.includes(d.id))
          .map(d => ({ id: d.id, ...d.data() }));
        setEligibleStudents(eligible);
      } else {
        setEligibleStudents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kelasId]);

  const handleToggleSelect = (uid) => {
    if (selectedStudentIds.includes(uid)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== uid));
    } else {
      setSelectedStudentIds([...selectedStudentIds, uid]);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setSaving(true);
    try {
      const currentIds = kelas.siswaIds || [];
      const updated = [...new Set([...currentIds, ...selectedStudentIds])];
      await updateDoc(doc(db, "kelas", kelasId), {
        siswaIds: updated,
      });
      setShowAddModal(false);
      setSelectedStudentIds([]);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan siswa ke kelas.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async (uid) => {
    if (!confirm("Keluarkan siswa ini dari kelas?")) return;
    try {
      const currentIds = kelas.siswaIds || [];
      const updated = currentIds.filter(id => id !== uid);
      await updateDoc(doc(db, "kelas", kelasId), {
        siswaIds: updated,
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus siswa.");
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={["staf", "super_admin"]}>
        <Navbar />
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </RouteGuard>
    );
  }

  if (!kelas) {
    return (
      <RouteGuard allowedRoles={["staf", "super_admin"]}>
        <Navbar />
        <div className="p-8 text-center text-gray-500">Kelas tidak ditemukan.</div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["staf", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/staf/kelas" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Kelas
        </Link>

        {/* Info Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-50 text-[#EA580C] uppercase tracking-wider">
              Kelola Anggota Kelas
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{kelas.nama}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Jadwal: {kelas.hari}, {kelas.jam} · Tempat: {kelas.tempat}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition shadow-sm self-start"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Siswa
          </button>
        </div>

        {/* Daftar Siswa Terdaftar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
            <span>Daftar Siswa di Kelas Ini ({enrolledStudents.length})</span>
          </h2>

          {enrolledStudents.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">
              Belum ada siswa di kelas ini. Klik tombol "Tambah Siswa" untuk memasukkan siswa dengan pendaftaran aktif.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Nama Siswa</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Kontak Orang Tua</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrolledStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3.5 font-bold text-gray-900">{s.nama}</td>
                      <td className="px-4 py-3.5">{s.email}</td>
                      <td className="px-4 py-3.5 font-mono text-xs">{s.noHpOrangTua || "-"}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Keluarkan dari kelas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Siswa */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Tambah Siswa ke Kelas</h3>
              <p className="text-xs text-gray-500 mb-6">
                Hanya menampilkan siswa yang status pendaftarannya AKTIF untuk program kelas ini.
              </p>

              {eligibleStudents.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-sm">
                  Tidak ada calon siswa dengan pendaftaran aktif yang tersedia untuk ditambahkan.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 mb-6 divide-y divide-gray-100">
                  {eligibleStudents.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={() => handleToggleSelect(s.id)}
                        className="w-4 h-4 text-[#EA580C] rounded focus:ring-[#EA580C]"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.nama}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Tutup
                </button>
                {eligibleStudents.length > 0 && (
                  <button
                    onClick={handleAddStudents}
                    disabled={saving || selectedStudentIds.length === 0}
                    className="px-5 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : `Tambahkan (${selectedStudentIds.length})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </RouteGuard>
  );
}
