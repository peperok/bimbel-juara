"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart3, Users, Calendar, Award } from "lucide-react";

function LaporanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentMonth = searchParams.get("bulan") || "Oktober";

  const [bulan, setBulan] = useState(currentMonth);
  const [siswaPerProgram, setSiswaPerProgram] = useState([]);
  const [kehadiranPerKelas, setKehadiranPerKelas] = useState([]);
  const [kelasPerTutor, setKelasPerTutor] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthsList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const loadLaporanData = async () => {
    try {
      const snapProg = await getDocs(collection(db, "program"));
      const progList = snapProg.docs.map(d => ({ id: d.id, ...d.data() }));

      const snapDaftar = await getDocs(collection(db, "pendaftaran"));
      const daftarList = snapDaftar.docs.map(d => ({ id: d.id, ...d.data() }));

      const snapKelas = await getDocs(collection(db, "kelas"));
      const kelasList = snapKelas.docs.map(d => ({ id: d.id, ...d.data() }));

      const snapPertemuan = await getDocs(collection(db, "pertemuan"));
      const pertemuanList = snapPertemuan.docs.map(d => ({ id: d.id, ...d.data() }));

      const snapUsers = await getDocs(collection(db, "users"));
      const usersMap = {};
      snapUsers.docs.forEach(u => { usersMap[u.id] = u.data().nama; });

      // 1. Siswa Aktif per Program (PRD 4.17)
      const progActiveMap = {};
      progList.forEach(p => {
        const activeCount = daftarList.filter(d => d.programId === p.id && d.status === "aktif").length;
        progActiveMap[p.nama] = activeCount;
      });
      setSiswaPerProgram(Object.entries(progActiveMap).map(([nama, total]) => ({ nama, total })));

      // 2. Kehadiran per Kelas (rata-rata persentase hadir)
      const kList = kelasList.map(k => {
        const totalSiswa = (k.siswaIds || []).length;
        const pert = pertemuanList.filter(p => p.kelasId === k.id);
        let pct = 0;
        if (pert.length > 0 && totalSiswa > 0) {
          const totalHadir = pert.reduce((acc, curr) => acc + (curr.hadirIds || []).length, 0);
          pct = Math.round((totalHadir / (pert.length * totalSiswa)) * 100);
        }
        return {
          nama: k.nama,
          totalSiswa,
          totalPertemuan: pert.length,
          persenHadir: pct,
        };
      });
      setKehadiranPerKelas(kList);

      // 3. Jumlah Kelas per Tutor (jumlah kelas dan jumlah pertemuan bulan itu)
      const tutorMap = {};
      kelasList.forEach(k => {
        if (!k.tutorId) return;
        const tName = usersMap[k.tutorId] || "Tutor";
        if (!tutorMap[tName]) {
          tutorMap[tName] = { kelasCount: 0, pertemuanCount: 0 };
        }
        tutorMap[tName].kelasCount += 1;
        const pertCount = pertemuanList.filter(p => p.kelasId === k.id).length;
        tutorMap[tName].pertemuanCount += pertCount;
      });

      setKelasPerTutor(Object.entries(tutorMap).map(([nama, data]) => ({
        nama,
        kelasCount: data.kelasCount,
        pertemuanCount: data.pertemuanCount,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaporanData();
  }, [bulan]);

  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setBulan(selected);
    router.push(`/admin/laporan?bulan=${selected}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Laporan Kinerja Bulanan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Rekap siswa aktif, kehadiran tatap muka, dan aktivitas pengajaran tutor.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm self-start">
          <span className="text-xs font-semibold text-gray-500 uppercase">Periode:</span>
          <select
            value={bulan}
            onChange={handleMonthChange}
            className="text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
          >
            {monthsList.map(m => (
              <option key={m} value={m}>{m} 2026</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tabel 1: Siswa Aktif per Program */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Siswa Aktif per Program Belajar
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Nama Program</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Jumlah Siswa Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {siswaPerProgram.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5 font-bold text-gray-900">{item.nama}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-[#EA580C]">
                        {item.total} siswa
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel 2: Kehadiran per Kelas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Calendar className="w-5 h-5 text-emerald-600 mr-2" />
              Kehadiran per Kelas Bimbingan
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Nama Kelas</th>
                    <th className="px-4 py-3 text-center">Jumlah Siswa</th>
                    <th className="px-4 py-3 text-center">Pertemuan Terlaksana</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Rata-rata Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kehadiranPerKelas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">Belum ada kelas aktif.</td>
                    </tr>
                  ) : (
                    kehadiranPerKelas.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 font-bold text-gray-900">{item.nama}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{item.totalSiswa}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{item.totalPertemuan}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                          {item.persenHadir}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel 3: Jumlah Kelas per Tutor */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Award className="w-5 h-5 text-purple-600 mr-2" />
              Aktivitas Pengajaran Tutor
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Nama Tutor</th>
                    <th className="px-4 py-3 text-center">Jumlah Kelas Diampu</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Total Pertemuan Diadakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kelasPerTutor.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-400">Belum ada penugasan tutor.</td>
                    </tr>
                  ) : (
                    kelasPerTutor.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 font-bold text-gray-900">{item.nama}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{item.kelasCount} kelas</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-purple-700">
                          {item.pertemuanCount} pertemuan
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LaporanPage() {
  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Memuat Laporan...</div>}>
        <LaporanContent />
      </Suspense>
    </RouteGuard>
  );
}
