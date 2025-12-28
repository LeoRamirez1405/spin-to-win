import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// Fill with your Firebase project config (copy from Firebase console)
const firebaseConfigPlaceholder = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

let db = null;
let gameRef = null;

function ensureInit(config = firebaseConfigPlaceholder) {
  if (!getApps().length) {
    initializeApp(config);
  }
  if (!db) db = getFirestore();
  if (!gameRef) gameRef = doc(db, 'games', 'shared');
  return gameRef;
}

export function initFirebase(config) {
  ensureInit(config);
}

export function subscribeToGame(onChange) {
  const ref = ensureInit();
  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange({});
      return;
    }
    onChange(snap.data());
  });
  return unsub;
}

export async function updateGameRemote(patch) {
  const ref = ensureInit();
  try {
    await setDoc(ref, patch, { merge: true });
  } catch (err) {
    console.error('Error updating remote game state', err);
  }
}

export default { initFirebase, subscribeToGame, updateGameRemote };
