import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkUsers() {
  const snap = await getDocs(collection(db, "users"));
  console.log(`Total users ditemukan: ${snap.size}`);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`- ${data.nama} | ${data.email} | Role: ${data.role} | Aktif: ${data.aktif}`);
  });
  process.exit(0);
}

checkUsers().catch(console.error);
