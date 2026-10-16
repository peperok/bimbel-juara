"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Users, Search, Shield, Check, X, Filter } from "lucide-react";

export default function KelolaPenggunaPage() {
  const { user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("semua");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("siswa");
  const [isAktif, setIsAktif] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditModal = (u) => {
    setEditingUser(u);
    setSelectedRole(u.role || "siswa");
    setIsAktif(u.aktif !== false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    // Validasi PRD 4.15: Super admin tidak bisa menurunkan peran atau menonaktifkan dirinya sendiri
    if (editingUser.id === currentUser?.uid) {
      if (selectedRole !== "super_admin" || !isAktif) {
        alert("Super Admin tidak dapat menurunkan peran atau menonaktifkan akunnya sendiri!");
        return;
      }
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        role: selectedRole,
        aktif: isAktif,
      });
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui pengguna.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchSearch = u.nama?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleStyles = {
    siswa: "bg-blue-100 text-blue-800",
    staf: "bg-amber-100 text-amber-800",
    tutor: "bg-emerald-100 text-emerald-800",
    super_admin: "bg-purple-100 text-purple-800",
  };

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Kelola Pengguna & Peran
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atur hak akses staf, pengajar (tutor), dan siswa bimbingan belajar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] shadow-sm"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] shadow-sm text-gray-700 font-medium"
            >
              <option value="semua">Semua Peran</option>
              <option value="siswa">Siswa</option>
              <option value="staf">Staf</option>
              <option value="tutor">Tutor</option>
              <option value="super_admin">Super Admin</option>
            </select>
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
                    <th className="px-4 py-3.5 rounded-l-xl">Nama Pengguna</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Peran (Role)</th>
                    <th className="px-4 py-3.5 text-center">Status Akun</th>
                    <th className="px-4 py-3.5 text-right rounded-r-xl">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Tidak ada pengguna yang cocok dengan kriteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 font-bold text-gray-900">
                          {u.nama}
                          {u.id === currentUser?.uid && (
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              (Anda)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">{u.email}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${roleStyles[u.role] || "bg-gray-100 text-gray-700"}`}>
                            {u.role?.replace("_", " ") || "siswa"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {u.aktif !== false ? (
                            <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                              <Check className="w-3.5 h-3.5 mr-1" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-semibold text-red-600">
                              <X className="w-3.5 h-3.5 mr-1" /> Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition"
                          >
                            Ubah Peran / Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Edit Role & Status */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ubah Hak Akses</h3>
              <p className="text-xs text-gray-500 mb-6">
                Pengguna: <strong className="text-gray-800">{editingUser.nama}</strong> ({editingUser.email})
              </p>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Pilih Peran (Role)*
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="staf">Staf (Administrasi)</option>
                    <option value="tutor">Tutor (Pengajar)</option>
                    <option value="super_admin">Super Admin (Pemilik)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAktif}
                      onChange={(e) => setIsAktif(e.target.checked)}
                      className="w-5 h-5 text-[#EA580C] rounded focus:ring-[#EA580C]"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Akun Aktif</span>
                      <p className="text-xs text-gray-500">
                        Bila dimatikan, pengguna tidak dapat masuk ke portal lagi.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold hover:bg-[#c2410c] transition shadow-sm"
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
