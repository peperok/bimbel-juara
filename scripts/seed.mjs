import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByD59PmUzkawDqvwCsKroztebH4ZSaY2k",
  authDomain: "bimbel-juara-efad6.firebaseapp.com",
  projectId: "bimbel-juara-efad6",
  storageBucket: "bimbel-juara-efad6.firebasestorage.app",
  messagingSenderId: "539454615151",
  appId: "1:539454615151:web:c8737cd1d9f0ed12d6a79a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding program...");
  // 1. Program
  const p1Ref = doc(db, "program", "program_utbk");
  await setDoc(p1Ref, {
    nama: "Intensif UTBK",
    jenjang: "SMA",
    jumlahPertemuan: 24,
    harga: 2500000,
    aktif: true
  });

  const p2Ref = doc(db, "program", "program_mat_smp");
  await setDoc(p2Ref, {
    nama: "Matematika SMP",
    jenjang: "SMP",
    jumlahPertemuan: 16,
    harga: 1500000,
    aktif: true
  });

  const p3Ref = doc(db, "program", "program_ipa_smp");
  await setDoc(p3Ref, {
    nama: "IPA Terpadu SMP",
    jenjang: "SMP",
    jumlahPertemuan: 16,
    harga: 1600000,
    aktif: true
  });

  console.log("Seeding seed_init marker...");
  await setDoc(doc(db, "_metadata", "seed"), {
    status: "seeded",
    seededAt: Timestamp.now()
  });

  console.log("Seed data berhasil dimasukkan!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Gagal seed:", err);
  process.exit(1);
});
