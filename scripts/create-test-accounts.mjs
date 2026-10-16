import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByD59PmUzkawDqvwCsKroztebH4ZSaY2k",
  authDomain: "bimbel-juara-efad6.firebaseapp.com",
  projectId: "bimbel-juara-efad6",
  storageBucket: "bimbel-juara-efad6.firebasestorage.app",
  messagingSenderId: "539454615151",
  appId: "1:539454615151:web:c8737cd1d9f0ed12d6a79a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  {
    nama: "Kak Fira",
    email: "fira@langkahjuara.id",
    pass: "fira123",
    role: "staf",
    noHp: "081234567891",
    noHpOrangTua: ""
  },
  {
    nama: "Kak Dimas",
    email: "dimas@langkahjuara.id",
    pass: "dimas123",
    role: "tutor",
    noHp: "081234567892",
    noHpOrangTua: ""
  },
  {
    nama: "Raka",
    email: "raka@langkahjuara.id",
    pass: "raka123",
    role: "siswa",
    noHp: "081234567893",
    noHpOrangTua: "085234567893"
  }
];

async function createAccounts() {
  for (const acc of accounts) {
    try {
      console.log(`Mendaftarkan ${acc.nama} (${acc.email})...`);
      const userCred = await createUserWithEmailAndPassword(auth, acc.email, acc.pass);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        nama: acc.nama,
        email: acc.email,
        noHp: acc.noHp,
        noHpOrangTua: acc.noHpOrangTua,
        role: acc.role,
        aktif: true,
        dibuatPada: serverTimestamp(),
      });

      console.log(`Berhasil membuat ${acc.nama} [role: ${acc.role}, UID: ${uid}]`);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        console.log(`Email ${acc.email} sudah terdaftar, memeriksa dokumen users...`);
      } else {
        console.error(`Gagal membuat akun ${acc.email}:`, err.message);
      }
    }
  }

  console.log("Semua akun uji selesai diproses!");
  process.exit(0);
}

createAccounts().catch(console.error);
