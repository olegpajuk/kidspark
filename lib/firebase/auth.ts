import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getClientAuth, getClientDb } from "./config";

function getGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("email");
  provider.addScope("profile");
  return provider;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const auth = getClientAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(credential.user, displayName);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getClientAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  const auth = getClientAuth();
  const provider = getGoogleProvider();

  try {
    const credential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    await handleGoogleCredential(credential.user);
    return credential.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    
    if (
      firebaseError.code === "auth/popup-blocked" ||
      firebaseError.code === "auth/popup-closed-by-user"
    ) {
      throw error;
    }

    if (
      firebaseError.code === "auth/unauthorized-domain" ||
      firebaseError.code === "auth/operation-not-allowed"
    ) {
      console.error(
        "Firebase Auth Error:",
        firebaseError.code,
        "\n\nTo fix this:\n" +
        "1. Go to Firebase Console > Authentication > Sign-in method\n" +
        "2. Enable Google as a sign-in provider\n" +
        "3. Go to Settings > Authorized domains\n" +
        "4. Add localhost and your production domain"
      );
    }

    throw error;
  }
}

export async function signInWithGoogleRedirect() {
  const auth = getClientAuth();
  const provider = getGoogleProvider();
  await signInWithRedirect(auth, provider);
}

export async function handleGoogleRedirectResult(): Promise<User | null> {
  const auth = getClientAuth();
  
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await handleGoogleCredential(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
  }
}

async function handleGoogleCredential(user: User) {
  await user.getIdToken(true);
  
  await createUserDocument(user, user.displayName ?? "");
}

export async function signOutUser() {
  const auth = getClientAuth();
  return signOut(auth);
}

export async function resetPassword(email: string) {
  const auth = getClientAuth();
  return sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  const auth = getClientAuth();
  return auth.currentUser;
}

async function createUserDocument(user: User, displayName: string) {
  const db = getClientDb();
  const ref = doc(db, "users", user.uid);
  
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || "",
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Failed to create user document:", error);
    console.error("User UID:", user.uid);
    console.error("Auth state:", user.email, "authenticated:", !!user.uid);
    throw error;
  }
}
