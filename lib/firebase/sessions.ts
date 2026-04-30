import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getClientDb } from "./config";
import type { GameSession, QuestionResult, SessionStatus } from "@/types/progress";
import type { GameId, DifficultyTier } from "@/types/game";
import type { SubjectId } from "@/types/child";

export interface CreateSessionInput {
  childId: string;
  parentUid: string;
  gameId: GameId;
  subject: SubjectId;
  difficulty: DifficultyTier;
  totalQuestions: number;
}

export interface UpdateSessionInput {
  questionResult?: QuestionResult;
  status?: SessionStatus;
  starsEarned?: 0 | 1 | 2 | 3;
  xpEarned?: number;
}

function sessionsRef(parentUid: string, childId: string) {
  const db = getClientDb();
  return collection(db, "users", parentUid, "children", childId, "sessions");
}

function sessionDoc(parentUid: string, childId: string, sessionId: string) {
  const db = getClientDb();
  return doc(db, "users", parentUid, "children", childId, "sessions", sessionId);
}

export async function createSession(input: CreateSessionInput): Promise<string> {
  const ref = sessionsRef(input.parentUid, input.childId);
  const now = new Date().toISOString();

  const session: Omit<GameSession, "id"> = {
    childId: input.childId,
    parentUid: input.parentUid,
    gameId: input.gameId,
    subject: input.subject,
    difficulty: input.difficulty,
    status: "in_progress",
    questionResults: [],
    totalQuestions: input.totalQuestions,
    correctCount: 0,
    starsEarned: 0,
    xpEarned: 0,
    startedAt: now,
    completedAt: null,
    durationSeconds: null,
  };

  const docRef = await addDoc(ref, session);
  return docRef.id;
}

export async function updateSession(
  parentUid: string,
  childId: string,
  sessionId: string,
  updates: UpdateSessionInput
): Promise<void> {
  const ref = sessionDoc(parentUid, childId, sessionId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const currentData = snap.data() as GameSession;

  const updatePayload: Record<string, unknown> = {};

  if (updates.questionResult) {
    const newResults = [...currentData.questionResults, updates.questionResult];
    const correctCount = newResults.filter((r) => r.answeredCorrectly).length;

    updatePayload.questionResults = newResults;
    updatePayload.correctCount = correctCount;
  }

  if (updates.status) {
    updatePayload.status = updates.status;

    if (updates.status === "completed" || updates.status === "abandoned") {
      updatePayload.completedAt = new Date().toISOString();
      const startTime = new Date(currentData.startedAt).getTime();
      updatePayload.durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    }
  }

  if (updates.starsEarned !== undefined) {
    updatePayload.starsEarned = updates.starsEarned;
  }

  if (updates.xpEarned !== undefined) {
    updatePayload.xpEarned = updates.xpEarned;
  }

  await updateDoc(ref, updatePayload);
}

export async function completeSession(
  parentUid: string,
  childId: string,
  sessionId: string,
  finalResults: {
    starsEarned: 0 | 1 | 2 | 3;
    xpEarned: number;
  }
): Promise<void> {
  await updateSession(parentUid, childId, sessionId, {
    status: "completed",
    starsEarned: finalResults.starsEarned,
    xpEarned: finalResults.xpEarned,
  });
}

export async function getSession(
  parentUid: string,
  childId: string,
  sessionId: string
): Promise<GameSession | null> {
  const ref = sessionDoc(parentUid, childId, sessionId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return { id: snap.id, ...snap.data() } as GameSession;
}

export async function getRecentSessions(
  parentUid: string,
  childId: string,
  gameId?: GameId,
  maxResults = 10
): Promise<GameSession[]> {
  const ref = sessionsRef(parentUid, childId);

  let q = query(ref, orderBy("startedAt", "desc"), limit(maxResults));

  if (gameId) {
    q = query(
      ref,
      where("gameId", "==", gameId),
      orderBy("startedAt", "desc"),
      limit(maxResults)
    );
  }

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as GameSession[];
}

export async function getCompletedSessionsForSubject(
  parentUid: string,
  childId: string,
  subject: SubjectId,
  maxResults = 20
): Promise<GameSession[]> {
  const ref = sessionsRef(parentUid, childId);

  const q = query(
    ref,
    where("subject", "==", subject),
    where("status", "==", "completed"),
    orderBy("startedAt", "desc"),
    limit(maxResults)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as GameSession[];
}

export function calculateStars(correctCount: number, totalQuestions: number, hintsUsed: number): 0 | 1 | 2 | 3 {
  const accuracy = correctCount / totalQuestions;
  const hintPenalty = Math.min(hintsUsed * 0.1, 0.3);
  const adjustedAccuracy = Math.max(0, accuracy - hintPenalty);

  if (adjustedAccuracy >= 0.9) return 3;
  if (adjustedAccuracy >= 0.7) return 2;
  if (adjustedAccuracy >= 0.5) return 1;
  return 0;
}

export function calculateXP(
  starsEarned: 0 | 1 | 2 | 3,
  difficulty: DifficultyTier,
  correctCount: number
): number {
  const baseXP = correctCount * 5;
  const difficultyBonus = difficulty * 2;
  const starBonus = starsEarned * 10;

  return baseXP + difficultyBonus + starBonus;
}
