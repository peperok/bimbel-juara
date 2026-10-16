"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Users, Search, Phone, Mail, BookOpen } from "lucide-react";

export default function DataSiswaPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        // Ambil semua user dengan peran siswa
        const qUsers = query(collection(db, "users"), where("role", "==", "siswa"));
        const snapUsers = await getDocs(qUsers);
        const usersList = snapUsers.docs.map(d => ({ id: d.id, ...d.data() }));

        // Ambil pendaftaran aktif untuk mengetahui program siswa
        const qDaftar = query(collection(db, "pendaftaran"), where("status", "==", "aktif"));
        const snapDaftar = await getDocs(qDaftar);
        
        // Ambil program
        const snapProg = await getDocs(collection(db, "program"));
        const progMap = {};
        snapProg.docs.forEach(p => { progMap[p.id] = p.data().nama; });

        const studentProgMap = {};
        snapDaftar.docs.forEach(d => {
          const data = d.data();
          if (!studentProgMap[data.siswaId]) studentProgMap[data.siswaId] = [];
          if (progMap[data.programId]) studentProgMap[data.siswaId].push(progMap[data.programId]);
        });

        const combined = usersList.map(u => ({
          ...u,
          programList: studentProgMap[u.id] || [],
        }));

        setStudents(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.nama?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RouteGuard allowedRoles={["staf", "super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Data Siswa Bimbel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Daftar kontak siswa dan nomor HP orang tua untuk koordinasi presensi & kegiatan belajar.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] shadow-sm"
            />
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
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">No HP Siswa</th>
                    <th className="px-4 py-3.5">No HP Orang Tua</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Program Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 font-bold text-gray-900">{s.nama}</td>
                        <td className="px-4 py-4">{s.email}</td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-700">{s.noHp || "-"}</td>
                        <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-900">
                          {s.noHpOrangTua || "-"}
                        </td>
                        <td className="px-4 py-4">
                          {s.programList.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {s.programList.map((prog, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-orange-50 text-[#EA580C] font-medium border border-orange-100">
                                  {prog}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada program aktif</span>
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
      </main>
    </RouteGuard>
  );
}
