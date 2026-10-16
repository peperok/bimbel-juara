import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Portal Belajar Langkah Juara",
  description: "Aplikasi Pendaftaran, Kelas, dan Tugas Bimbingan Belajar Langkah Juara",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F7F5F2] text-[#1F2937] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
