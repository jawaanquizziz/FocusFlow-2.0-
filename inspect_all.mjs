import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
await signInAnonymously(auth);

const allSnap = await getDocs(collection(db, "users"));

const users = allSnap.docs.map(d => {
  const data = d.data();
  const sessions = data.sessions || [];
  const treesFromArr = sessions.filter(s => s.mode === 'pomodoro' || s.mode === 'stopwatch').length;
  return {
    id: d.id,
    name: (data.name || 'Anonymous').padEnd(28),
    treesDB:    Number(data.treesPlanted  || 0),
    sessionsDB: Number(data.sessionsCount || 0),
    focusHrs:   ((data.totalFocusTime || 0) / 3600).toFixed(1),
    arrLen:     sessions.length,
    treesFromArr,
    // diff = what the sessions array says vs what DB says
    diff: treesFromArr - Number(data.treesPlanted || 0)
  };
}).sort((a, b) => b.treesDB - a.treesDB);

console.log("\n╔══════════════════════════════════════════════════════════════════════════════════════════════╗");
console.log("║  USER                       │  DB Trees │  Arr Trees │ Diff │ DB Sess │ Arr Len │ Focus Hrs ║");
console.log("╠══════════════════════════════════════════════════════════════════════════════════════════════╣");
users.slice(0, 25).forEach(u => {
  const flag = u.diff > 0 ? " ⚠️ " : u.diff < 0 ? " ✅ " : "    ";
  console.log(
    `║  ${u.name} │    ${String(u.treesDB).padEnd(6)} │     ${String(u.treesFromArr).padEnd(6)} │${flag.padEnd(5)}│    ${String(u.sessionsDB).padEnd(4)} │    ${String(u.arrLen).padEnd(4)} │  ${String(u.focusHrs).padEnd(8)} ║`
  );
});
console.log("╚══════════════════════════════════════════════════════════════════════════════════════════════╝\n");

// Show UIDs for specific names
const targets = ['ishanvi', 'nerdy', '🤓', 'jawaan', 'ryx', 'chrisy', 'shamika'];
console.log("=== UIDs for specific users ===");
allSnap.docs.forEach(d => {
  const name = (d.data().name || '').toLowerCase();
  if (targets.some(t => name.includes(t))) {
    const data = d.data();
    const sessions = data.sessions || [];
    const treesFromArr = sessions.filter(s => s.mode === 'pomodoro' || s.mode === 'stopwatch').length;
    console.log(`  ${d.data().name || 'Anonymous'} (${d.id})`);
    console.log(`    DB: ${data.treesPlanted} trees, ${data.sessionsCount} sessions, ${(data.totalFocusTime/3600).toFixed(1)}h`);
    console.log(`    Sessions Array: ${sessions.length} entries, ${treesFromArr} tree sessions\n`);
  }
});

process.exit(0);
