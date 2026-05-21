import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWSn4gt-iC5ZL0TITLfGRwx4nYAS5ANgU",
  authDomain: "focusflow-42f9d.firebaseapp.com",
  projectId: "focusflow-42f9d",
  storageBucket: "focusflow-42f9d.firebasestorage.app",
  messagingSenderId: "266779318461",
  appId: "1:266779318461:web:4908105acd3fcc2c2effd4",
  measurementId: "G-EWH7EGC5JP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function inspect() {
  console.log("Signing in anonymously...");
  await signInAnonymously(auth);
  
  const uid = "aUM5MbUprIb9BGhinpGRnBzDUxz2";
  console.log(`Fetching user document for UID: ${uid}...`);
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    console.error("User not found!");
    process.exit(1);
  }
  
  const data = snap.data();
  const sessions = data.sessions || [];
  console.log(`User Name: ${data.name}`);
  console.log(`Total sessions in database array: ${sessions.length}`);
  console.log(`Current DB Trees: ${data.treesPlanted}`);
  console.log(`Current DB Focus Time: ${data.totalFocusTime}`);
  
  if (sessions.length > 0) {
    console.log("\nFirst 5 sessions:");
    sessions.slice(0, 5).forEach((s, idx) => {
      console.log(`  Session ${idx + 1}:`, s);
    });
    
    console.log("\nLast 5 sessions:");
    sessions.slice(-5).forEach((s, idx) => {
      console.log(`  Session ${sessions.length - 4 + idx}:`, s);
    });
  }
  
  process.exit(0);
}

inspect().catch(err => {
  console.error("Error inspecting database:", err);
  process.exit(1);
});
