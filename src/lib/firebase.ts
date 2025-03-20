import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_PROJECT_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Funktionen für Auth & Votes
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  return signOut(auth);
}

export async function saveVote(userId: string, votes: { name: string; value: number }[]) {
  const voteRef = doc(db, "votes", userId);
  await setDoc(voteRef, { votes, timestamp: new Date() });
}

export async function getVotes(userId: string) {
  const voteRef = doc(db, "votes", userId);
  const docSnap = await getDoc(voteRef);
  return docSnap.exists() ? docSnap.data() : null;
}
