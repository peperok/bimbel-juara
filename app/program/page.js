"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Check, Clock, AlertCircle } from "lucide-react";

export default function ProgramPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [myPendaftaran, setMyPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    if (!user) return;
    try {
      // Ambil program yang aktif
      const qProg = query(collection(db, "program"), where("aktif", "==", true));
      const snapProg = await getDocs(qProg);
      setPrograms(snapProg.docs.map(d => ({ id: d.id, ...d.data() })));

      // Ambil riwayat pendaftaran saya
      const qDaftar = query(collection(db, "pendaftaran"), where("siswaId", "==", user.uid));
      const snapDaftar = await getDocs(qDaftar);
      setMyPendaftaran(snapDaftar.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAjukan = async (programId) => {
    setMessage("");
    setSubmittingId(programId);
    try {
      await addDoc(collection(db, "pendaftaran"), {
        siswaId: user.uid,
        programId: programId,
        status: "menunggu",
        catatanStaf: "",
        dibuatPada: serverTimestamp(),
      });
      setMessage("Pendaftaran terkirim. Selesaikan pembayaran di kantor Langkah Juara.");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengajukan pendaftaran.");
    } finally {
      setSubmittingId(null);
    }
  };

  const statusPilStyles = {
    menunggu: "bg-amber-100 text-amber-800 border-amber-200",
    aktif: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ditolak: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <RouteGuard allowedRoles={["siswa", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Katalog Program Bimbel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Pilih program bimbingan belajar terbaik untuk mendukung prestasi akademikmu.
          </p>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Daftar Kartu Program */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {programs.map((p) => {
            const existing = myPendaftaran.find(d => d.programId === p.id);
            const isWaitingOrActive = existing && (existing.status === "menunggu" || existing.status === "aktif");

            return (
              <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-50 text-[#EA580C] uppercase tracking-wider">
                      Jenjang {p.jenjang}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {p.jumlahPertemuan} Pertemuan
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{p.nama}</h3>
                  <p className="text-2xl font-black text-gray-900 font-mono mb-6">
                    Rp {Number(p.harga || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                <div>
                  {isWaitingOrActive ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                      {existing.status === "menunggu" ? "Pendaftaran Menunggu" : "Sudah Terdaftar (Aktif)"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAjukan(p.id)}
                      disabled={submittingId === p.id}
                      className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white py-2.5 rounded-xl text-sm font-semibold transition duration-150 shadow-sm"
                    >
                      {submittingId === p.id ? "Mengirim..." : "Ajukan Pendaftaran"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabel Pendaftaran Saya */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Pendaftaran Saya
          </h2>

          {myPendaftaran.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Belum ada riwayat pendaftaran.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Program</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Catatan Staf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myPendaftaran.map((d) => {
                    const prog = programs.find(p => p.id === d.programId);
                    return (
                      <tr key={d.id}>
                        <td className="px-4 py-3.5 font-medium text-gray-900">
                          {prog ? prog.nama : d.programId}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusPilStyles[d.status] || "bg-gray-100 text-gray-700"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          {d.catatanStaf || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </RouteGuard>
  );
}
