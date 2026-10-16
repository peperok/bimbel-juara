"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { BookOpen, Plus, Check, X } from "lucide-react";

export default function KelolaProgramAdminPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Tambah Program
  const [showModal, setShowModal] = useState(false);
  const [nama, setNama] = useState("");
  const [jenjang, setJenjang] = useState("SMA");
  const [jumlahPertemuan, setJumlahPertemuan] = useState(16);
  const [harga, setHarga] = useState(1500000);
  const [submitting, setSubmitting] = useState(false);

  const loadPrograms = async () => {
    try {
      const snap = await getDocs(collection(db, "program"));
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (jumlahPertemuan <= 0 || harga <= 0) {
      alert("Jumlah pertemuan dan harga harus lebih dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "program"), {
        nama: nama,
        jenjang: jenjang,
        jumlahPertemuan: Number(jumlahPertemuan),
        harga: Number(harga),
        aktif: true,
      });
      setShowModal(false);
      setNama("");
      setJumlahPertemuan(16);
      setHarga(1500000);
      await loadPrograms();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan program.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAktif = async (p) => {
    try {
      await updateDoc(doc(db, "program", p.id), {
        aktif: !p.aktif,
      });
      await loadPrograms();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status program.");
    }
  };

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Kelola Program Bimbingan Belajar
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atur daftar paket bimbingan belajar, jenjang pendidikan, kuota pertemuan, dan biaya.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-sm font-semibold transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Program
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
                    <th className="px-4 py-3.5 rounded-l-xl">Nama Program</th>
                    <th className="px-4 py-3.5">Jenjang</th>
                    <th className="px-4 py-3.5 text-center">Pertemuan</th>
                    <th className="px-4 py-3.5">Harga Paket</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right rounded-r-xl">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4 font-bold text-gray-900">{p.nama}</td>
                      <td className="px-4 py-4 font-medium">{p.jenjang}</td>
                      <td className="px-4 py-4 text-center font-mono">{p.jumlahPertemuan}</td>
                      <td className="px-4 py-4 font-mono font-semibold text-gray-900">
                        Rp {Number(p.harga || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {p.aktif ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleToggleAktif(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            p.aktif
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {p.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Tambah Program */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Program Bimbel</h3>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nama Program*
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Intensif UTBK B"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Jenjang*
                  </label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Pertemuan*
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={jumlahPertemuan}
                      onChange={(e) => setJumlahPertemuan(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Harga (Rp)*
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition shadow-sm"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Program"}
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
