import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWSn4gt-iC5ZL0TITLfGRwx4nYAS5ANgU",
  authDomain: "focusflow-42f9d.firebaseapp.com",
  projectId: "focusflow-42f9d",
  storageBucket: "focusflow-42f9d.firebasestorage.app",
  messagingSenderId: "266779318461",
  appId: "1:266779318461:web:4908105acd3fcc2c2effd4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Signing in...");
await signInAnonymously(auth);

// Jawaan's UID from check_db_temp.js
const JAWAAN_UID = "aUM5MbUprIb9BGhinpGRnBzDUxz2";

const snap = await getDoc(doc(db, "users", JAWAAN_UID));
if (!snap.exists()) {
  console.error("User document not found!");
  process.exit(1);
}

const data = snap.data();
const sessions = data.sessions || [];
const treeSessionsInArr = sessions.filter(s => s.mode === 'pomodoro' || s.mode === 'stopwatch').length;

console.log("\n=== JAWAAN'S CURRENT FIRESTORE STATE ===");
console.log("  treesPlanted    :", data.treesPlanted);
console.log("  sessionsCount   :", data.sessionsCount);
console.log("  totalFocusTime  :", data.totalFocusTime, "sec =", (data.totalFocusTime / 3600).toFixed(2), "hrs");
console.log("  sessions array  :", sessions.length, "entries");
console.log("  tree sessions   :", treeSessionsInArr, "(from array)");
console.log("=========================================\n");

// Check all users for leaderboard
const allSnap = await getDocs(collection(db, "users"));
const allUsers = allSnap.docs
  .map(d => ({ id: d.id, name: d.data().name || 'Anonymous', trees: Number(d.data().treesPlanted || 0), sess: Number(d.data().sessionsCount || 0) }))
  .sort((a, b) => b.trees - a.trees)
  .slice(0, 15);

console.log("=== TOP 15 LEADERBOARD (current) ===");
allUsers.forEach((u, i) => {
  const tag = u.id === JAWAAN_UID ? " ← JAWAAN" : "";
  console.log(`  #${(i+1).toString().padStart(2)} ${u.name.padEnd(25)} ${u.trees} trees  ${u.sess} sessions${tag}`);
});
console.log("=====================================\n");

// ─── RESTORATION ─────────────────────────────────────────────────────────────
// The user says they previously had 91 trees. We restore to the MAXIMUM of:
// - what Firestore currently says
// - the known correct value (91 trees)
const CORRECT_TREES    = 91;   // <── what Jawaan says is correct
const CORRECT_SESSIONS = Math.max(Number(data.sessionsCount || 0), CORRECT_TREES); // sessions ≥ trees

const currentTrees    = Number(data.treesPlanted  || 0);
const currentSessions = Number(data.sessionsCount || 0);
const currentFocus    = Number(data.totalFocusTime || 0);

if (currentTrees >= CORRECT_TREES && currentSessions >= CORRECT_SESSIONS) {
  console.log("✅ Jawaan's data looks correct already - no restore needed.");
  console.log("   treesPlanted  :", currentTrees, "(already >=", CORRECT_TREES, ")");
  console.log("   sessionsCount :", currentSessions, "(already >=", CORRECT_SESSIONS, ")");
} else {
  const targetTrees    = Math.max(currentTrees,    CORRECT_TREES);
  const targetSessions = Math.max(currentSessions, CORRECT_SESSIONS);

  console.log("🔧 Restoring Jawaan's data...");
  console.log("   treesPlanted  :", currentTrees, "→", targetTrees);
  console.log("   sessionsCount :", currentSessions, "→", targetSessions);
  console.log("   totalFocusTime:", currentFocus, "(unchanged)");

  await setDoc(doc(db, "users", JAWAAN_UID), {
    treesPlanted:  targetTrees,
    sessionsCount: targetSessions,
    // totalFocusTime stays at its current value (already the max)
  }, { merge: true });

  console.log("\n✅ RESTORED SUCCESSFULLY!");

  // Verify the write
  const verify = await getDoc(doc(db, "users", JAWAAN_UID));
  const vd = verify.data();
  console.log("\n=== VERIFIED FIRESTORE STATE ===");
  console.log("  treesPlanted :", vd.treesPlanted);
  console.log("  sessionsCount:", vd.sessionsCount);
  console.log("================================");
}

process.exit(0);
