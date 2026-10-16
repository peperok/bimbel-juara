"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  User, 
  Users, 
  Layers, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  CheckCircle2,
  FolderOpen
} from "lucide-react";

export default function Navbar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!profile) return null;

  const role = profile.role || "siswa";

  const handleLogout = async () => {
    await logout();
    router.push("/masuk");
  };

  const roleBadgeStyles = {
    siswa: "bg-blue-100 text-blue-700 border-blue-200",
    staf: "bg-amber-100 text-amber-700 border-amber-200",
    tutor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  };

  // Nav Links berdasarkan PRD Bab 2.3 & 3.1
  const getNavLinks = () => {
    const links = [];

    // Siswa atau Super Admin
    if (role === "siswa" || role === "super_admin") {
      links.push(
        { href: "/beranda", label: "Beranda", icon: GraduationCap },
        { href: "/program", label: "Program", icon: BookOpen },
        { href: "/kelas", label: "Kelas Saya", icon: Calendar },
      );
    }

    // Staf atau Super Admin
    if (role === "staf" || role === "super_admin") {
      links.push(
        { href: "/staf", label: "Dasbor Staf", icon: Layers },
        { href: "/staf/pendaftaran", label: "Pendaftaran", icon: CheckCircle2 },
        { href: "/staf/kelas", label: "Kelola Kelas", icon: FolderOpen },
        { href: "/staf/siswa", label: "Data Siswa", icon: Users },
      );
    }

    // Tutor atau Super Admin
    if (role === "tutor" || role === "super_admin") {
      links.push(
        { href: "/tutor", label: "Dasbor Tutor", icon: BookOpen },
      );
    }

    // Super Admin
    if (role === "super_admin") {
      links.push(
        { href: "/admin", label: "Dasbor Admin", icon: BarChart3 },
        { href: "/admin/pengguna", label: "Kelola Pengguna", icon: Users },
        { href: "/admin/program", label: "Program (Admin)", icon: Layers },
        { href: "/admin/laporan", label: "Laporan", icon: FileText },
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-xl shadow-sm">
              LJ
            </div>
            <div>
              <Link href="/" className="font-bold text-gray-900 tracking-tight text-lg hover:text-[#EA580C] transition">
                Langkah Juara
              </Link>
              <p className="text-xs text-gray-500 hidden sm:block">Portal Belajar & Bimbingan</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.slice(0, 6).map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href) && link.href !== "/staf" && link.href !== "/admin");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-50 text-[#EA580C]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900 leading-tight">
                {profile.nama}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border self-end mt-0.5 font-medium uppercase tracking-wider ${roleBadgeStyles[role]}`}>
                {role.replace("_", " ")}
              </span>
            </div>

            <Link
              href="/profil"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Profil Saya"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 border-b border-gray-100 mb-2">
            <p className="font-semibold text-gray-900 text-sm">{profile.nama}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-1 uppercase font-medium ${roleBadgeStyles[role]}`}>
              Peran: {role.replace("_", " ")}
            </span>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-orange-50 text-[#EA580C]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
