import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

let db = null;
let gameRef = null;

function getConfigFromEnv() {
  // Vite exposes env vars as import.meta.env.VITE_*
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  if (!projectId || projectId === 'REPLACE_ME') return null;
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

function ensureInit(config) {
  const cfg = config || getConfigFromEnv();
  if (!cfg) return null;
  if (!getApps().length) {
    initializeApp(cfg);
  }
  if (!db) db = getFirestore();
  if (!gameRef) gameRef = doc(db, 'games', 'shared');
  return gameRef;
}

export function initFirebase(config) {
  return ensureInit(config);
}

export function subscribeToGame(onChange) {
  const ref = ensureInit();
  if (!ref) {
    console.warn('Firebase not configured. subscribeToGame is a no-op.');
    return () => {};
  }
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
  if (!ref) {
    console.warn('Firebase not configured. updateGameRemote is a no-op.');
    return;
  }
  try {
    await setDoc(ref, patch, { merge: true });
  } catch (err) {
    console.error('Error updating remote game state', err);
  }
}

export default { initFirebase, subscribeToGame, updateGameRemote };
