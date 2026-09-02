import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJaM8ixgsQjHkLwyRetwJ5Uj0mUOpNpbc",
  authDomain: "maktab-ai-uz-2026.firebaseapp.com",
  projectId: "maktab-ai-uz-2026",
  storageBucket: "maktab-ai-uz-2026.firebasestorage.app",
  messagingSenderId: "1002400191195",
  appId: "1:1002400191195:web:7bab7ae62d6e35e43d32fe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    console.log("Fetching users...");
    const usersSnap = await getDocs(query(collection(db, "users"), limit(5)));
    console.log(`Found ${usersSnap.size} users.`);
    usersSnap.forEach(doc => console.log(doc.id, doc.data()));

    console.log("Fetching results...");
    const resultsSnap = await getDocs(query(collection(db, "results"), limit(5)));
    console.log(`Found ${resultsSnap.size} results.`);
    resultsSnap.forEach(doc => console.log(doc.id, doc.data()));
  } catch (err) {
    console.error("Firestore Error:", err.message);
  }
}

run();
