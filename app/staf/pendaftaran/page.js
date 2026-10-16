"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { Check, X, Filter, AlertCircle, Clock } from "lucide-react";

function PendaftaranContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "semua";

  const [pendaftaran, setPendaftaran] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [programsMap, setProgramsMap] = useState({});
  const [filter, setFilter] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  // Modal Tolak
  const [rejectingId, setRejectingId] = useState(null);
  const [catatanStaf, setCatatanStaf] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    try {
      const snapDaftar = await getDocs(collection(db, "pendaftaran"));
      const daftarList = snapDaftar.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendaftaran(daftarList);

      const snapUsers = await getDocs(collection(db, "users"));
      const uMap = {};
      snapUsers.docs.forEach(d => { uMap[d.id] = d.data().nama; });
      setUsersMap(uMap);

      const snapProg = await getDocs(collection(db, "program"));
      const pMap = {};
      snapProg.docs.forEach(d => { pMap[d.id] = d.data().nama; });
      setProgramsMap(pMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    if (!confirm("Setujui pendaftaran ini dan tandai status aktif?")) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, "pendaftaran", id), {
        status: "aktif",
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui pendaftaran.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!catatanStaf.trim()) {
      alert("Catatan staf wajib diisi saat menolak pendaftaran.");
      return;
    }

    setProcessing(true);
    try {
      await updateDoc(doc(db, "pendaftaran", rejectingId), {
        status: "ditolak",
        catatanStaf: catatanStaf.trim(),
      });
      setRejectingId(null);
      setCatatanStaf("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menolak pendaftaran.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredList = pendaftaran.filter(p => {
    if (filter === "semua") return true;
    return p.status === filter;
  });

  const statusPilStyles = {
    menunggu: "bg-amber-100 text-amber-800 border-amber-200",
    aktif: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ditolak: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Kelola Pendaftaran Siswa
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Verifikasi bukti pembayaran pendaftaran siswa di kantor bimbel.
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-gray-200 self-start">
          {["semua", "menunggu", "aktif", "ditolak"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === st
                  ? "bg-[#EA580C] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
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
                  <th className="px-4 py-3.5 rounded-l-xl">Nama Siswa</th>
                  <th className="px-4 py-3.5">Program</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Catatan Staf</th>
                  <th className="px-4 py-3.5 text-right rounded-r-xl">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Tidak ada permohonan pendaftaran dengan status ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4 font-bold text-gray-900">
                        {usersMap[item.siswaId] || item.siswaId}
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium">
                        {programsMap[item.programId] || item.programId}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusPilStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {item.catatanStaf || "-"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.status === "menunggu" && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={processing}
                              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(item.id);
                                setCatatanStaf("");
                              }}
                              disabled={processing}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tolak Pendaftaran */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tolak Pendaftaran Siswa</h3>
            <p className="text-xs text-gray-500 mb-4">
              Harap cantumkan alasan atau catatan staf bagi siswa (contoh: Belum menyelesaikan administrasi).
            </p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={3}
                value={catatanStaf}
                onChange={(e) => setCatatanStaf(e.target.value)}
                placeholder="Tulis catatan penolakan di sini..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white mb-4"
              ></textarea>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  {processing ? "Memproses..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PendaftaranPage() {
  return (
    <RouteGuard allowedRoles={["staf", "super_admin"]}>
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
        <PendaftaranContent />
      </Suspense>
    </RouteGuard>
  );
}
