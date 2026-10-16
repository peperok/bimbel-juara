import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function promoteAdmin() {
  const email = "arif@langkahjuara.id";
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.error(`User dengan email ${email} tidak ditemukan di koleksi users!`);
    process.exit(1);
  }

  const userDoc = snap.docs[0];
  console.log(`Ditemukan UID: ${userDoc.id}`);
  console.log("Data sebelumnya:", userDoc.data());

  await updateDoc(doc(db, "users", userDoc.id), {
    role: "super_admin"
  });

  console.log("Role berhasil diperbarui menjadi: super_admin!");
  const updatedSnap = await getDocs(q);
  console.log("Data sesudah diubah:", updatedSnap.docs[0].data());
  process.exit(0);
}

promoteAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
