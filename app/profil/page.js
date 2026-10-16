"use client";

import React, { useState, useEffect } from "react";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { User, Phone, Mail, Shield, Check, AlertCircle } from "lucide-react";

export default function ProfilPage() {
  const { user, profile } = useAuth();
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [noHpOrangTua, setNoHpOrangTua] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setNama(profile.nama || "");
      setNoHp(profile.noHp || "");
      setNoHpOrangTua(profile.noHpOrangTua || "");
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validasi PRD 4.6: nomor HP diawali 08, panjang 10-13 digit
    const validatePhone = (num) => {
      if (!num) return true; // boleh kosong bila belum diisi
      const regex = /^08[0-9]{8,11}$/;
      return regex.test(num);
    };

    if (noHp && !validatePhone(noHp)) {
      setError("Nomor HP harus berupa angka, 10-13 digit, dan diawali dengan 08.");
      return;
    }

    if (profile?.role === "siswa" && noHpOrangTua && !validatePhone(noHpOrangTua)) {
      setError("Nomor HP Orang Tua harus berupa angka, 10-13 digit, dan diawali dengan 08.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        nama: nama,
        noHp: noHp,
      };

      if (profile?.role === "siswa") {
        updateData.noHpOrangTua = noHpOrangTua;
      }

      await updateDoc(userRef, updateData);
      setMessage("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["siswa", "staf", "tutor", "super_admin"]}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold text-2xl">
              {nama ? nama.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.nama}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase mt-2">
                Peran: {profile?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Alamat Email (Tidak dapat diubah)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nomor HP (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
                />
              </div>
            </div>

            {profile?.role === "siswa" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nomor HP Orang Tua
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={noHpOrangTua}
                    onChange={(e) => setNoHpOrangTua(e.target.value)}
                    placeholder="Contoh: 085234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white py-3 rounded-xl text-sm font-semibold transition duration-150 shadow-sm disabled:opacity-70 mt-2"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </main>
    </RouteGuard>
  );
}
