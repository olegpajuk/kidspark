/**
 * Web Speech API wrapper for speech recognition.
 * Falls back gracefully when the browser does not support the API.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionClass = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionClass | undefined;
    webkitSpeechRecognition: SpeechRecognitionClass | undefined;
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

function getSpeechRecognitionClass(): SpeechRecognitionClass | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * Recognise a single speech utterance.
 * Resolves with the best transcript, or rejects on error/no-speech.
 */
export function recognizeSpeech(lang = "en-US"): Promise<SpeechRecognitionResult> {
  return new Promise((resolve, reject) => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) {
      reject(new Error("SpeechRecognition is not supported in this browser."));
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const best = event.results[0]?.[0];
      if (best) {
        resolve({ transcript: best.transcript.trim().toLowerCase(), confidence: best.confidence });
      } else {
        reject(new Error("No speech detected."));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      reject(new Error(event.error));
    };

    recognition.onnomatch = () => {
      reject(new Error("No match found for spoken input."));
    };

    recognition.start();
  });
}

/**
 * Compare spoken word to expected word.
 * Returns true if the transcript closely matches (case-insensitive, trimmed).
 */
export function matchesSpeech(
  transcript: string,
  expected: string,
  acceptableVariants: string[] = []
): boolean {
  const norm = (s: string) => s.toLowerCase().trim();
  const t = norm(transcript);
  if (t === norm(expected)) return true;
  return acceptableVariants.some((v) => t === norm(v));
}
