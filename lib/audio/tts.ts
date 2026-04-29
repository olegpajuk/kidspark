/**
 * Text-to-Speech service wrapping the browser SpeechSynthesis API.
 * Designed with an ElevenLabs upgrade path: swap out the speak* functions
 * to call a remote API instead, keeping all callers unchanged.
 */

export type TTSRate = "normal" | "slow" | "very-slow";

const RATE_MAP: Record<TTSRate, number> = {
  normal: 1.0,
  slow: 0.65,
  "very-slow": 0.45,
};

let preferredVoice: SpeechSynthesisVoice | null = null;

function getVoice(): SpeechSynthesisVoice | null {
  if (preferredVoice) return preferredVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Prefer a child-friendly English voice
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("moira") ||
        v.name.toLowerCase().includes("tessa"))
  );

  const english = voices.find((v) => v.lang === "en-US" || v.lang === "en-GB");

  preferredVoice = preferred ?? english ?? voices[0];
  return preferredVoice;
}

function buildUtterance(text: string, rate: TTSRate): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = RATE_MAP[rate];
  utterance.pitch = 1.1;
  utterance.volume = 1;

  const voice = getVoice();
  if (voice) utterance.voice = voice;

  return utterance;
}

/**
 * Initialise voice list. Call once on app mount so voices are ready.
 * Browsers load voices asynchronously — this triggers the load.
 */
export function initTTS(): void {
  if (typeof window === "undefined") return;

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      preferredVoice = null; // reset so next call re-selects
    });
  }
}

/** Cancel any in-progress speech */
export function cancelSpeech(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}

/**
 * Speak a single word.
 * @param word  The word to pronounce
 * @param rate  Playback speed (default: "normal")
 * @returns Promise that resolves when speech ends
 */
export function speakWord(word: string, rate: TTSRate = "normal"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = buildUtterance(word, rate);
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === "interrupted") resolve();
      else reject(new Error(e.error));
    };
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak a word at normal speed, then again slowly.
 * Useful for dictation and pronunciation practice.
 */
export async function speakWordDouble(word: string): Promise<void> {
  await speakWord(word, "normal");
  await new Promise((r) => setTimeout(r, 400));
  await speakWord(word, "slow");
}

/**
 * Speak a full sentence (for dictation practice).
 * @param text  Sentence text
 * @param rate  Playback speed
 */
export function speakSentence(text: string, rate: TTSRate = "normal"): Promise<void> {
  return speakWord(text, rate);
}

/**
 * Spell out a word letter by letter.
 */
export async function spellWord(word: string): Promise<void> {
  for (const letter of word.split("")) {
    await speakWord(letter, "slow");
    await new Promise((r) => setTimeout(r, 200));
  }
}

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
