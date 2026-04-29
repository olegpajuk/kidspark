import {
  collection,
  addDoc,
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
