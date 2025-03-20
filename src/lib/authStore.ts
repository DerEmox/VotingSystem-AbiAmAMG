import { writable } from "svelte/store";
import { auth } from "./firebase.js";
import type { User } from "firebase/auth";

export const user = writable<User | null>(null);

auth.onAuthStateChanged((firebaseUser) => {
  user.set(firebaseUser);
});
