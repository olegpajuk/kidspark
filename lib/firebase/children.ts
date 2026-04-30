import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "./config";
import type { Child, ChildSummary, SubjectId, AvatarId, ChildPreferences, ChildLevel } from "@/types";

const ALL_SUBJECTS: SubjectId[] = ["maths", "finance", "english", "geography", "computer"];

function buildDefaultLevels(): Record<SubjectId, ChildLevel> {
  return Object.fromEntries(
    ALL_SUBJECTS.map((subject) => [
      subject,
      { subject, xp: 0, level: 1, adaptiveDifficulty: 1 } satisfies ChildLevel,
    ])
  ) as Record<SubjectId, ChildLevel>;
}

export interface CreateChildInput {
  parentUid: string;
  name: string;
  dateOfBirth: string;
  avatarId: AvatarId;
  preferences: ChildPreferences;
}

export async function createChild(input: CreateChildInput): Promise<string> {
  const db = getClientDb();
  const childrenRef = collection(db, "users", input.parentUid, "children");
  const now = new Date().toISOString();

  const docRef = await addDoc(childrenRef, {
    parentUid: input.parentUid,
    name: input.name,
    dateOfBirth: input.dateOfBirth,
    avatarId: input.avatarId,
    preferences: input.preferences,
    levels: buildDefaultLevels(),
    starBalance: 0,
    totalStarsEarned: 0,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function deleteChild(parentUid: string, childId: string): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, "users", parentUid, "children", childId));
}

export function subscribeToChildren(
  parentUid: string,
  callback: (children: ChildSummary[]) => void
): () => void {
  const db = getClientDb();
  const childrenRef = collection(db, "users", parentUid, "children");
  const q = query(childrenRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snap) => {
    const children = snap.docs.map((d) => {
      const data = d.data() as Child;
      return {
        id: d.id,
        name: data.name,
        avatarId: data.avatarId,
        starBalance: data.starBalance,
        levels: data.levels,
      } satisfies ChildSummary;
    });
    callback(children);
  });
}

export async function resetChildStats(
  parentUid: string,
  childId: string,
  options: {
    resetStars?: boolean;
    resetXP?: boolean;
    resetLevels?: boolean;
    subjects?: SubjectId[];
  } = {}
): Promise<void> {
  const db = getClientDb();
  const childRef = doc(db, "users", parentUid, "children", childId);
  
  const { resetStars = true, resetXP = true, resetLevels = true, subjects } = options;
  const subjectsToReset = subjects ?? ALL_SUBJECTS;
  
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (resetStars) {
    updates.starBalance = 0;
    updates.totalStarsEarned = 0;
  }

  if (resetXP || resetLevels) {
    for (const subject of subjectsToReset) {
      if (resetXP) {
        updates[`levels.${subject}.xp`] = 0;
      }
      if (resetLevels) {
        updates[`levels.${subject}.level`] = 1;
        updates[`levels.${subject}.adaptiveDifficulty`] = 1;
      }
    }
  }

  const { updateDoc } = await import("firebase/firestore");
  await updateDoc(childRef, updates);
}

export async function getChild(
  parentUid: string,
  childId: string
): Promise<Child | null> {
  const db = getClientDb();
  const { getDoc } = await import("firebase/firestore");
  const childRef = doc(db, "users", parentUid, "children", childId);
  const snap = await getDoc(childRef);
  
  if (!snap.exists()) {
    return null;
  }
  
  return { id: snap.id, ...snap.data() } as Child;
}
