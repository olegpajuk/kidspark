export type SoundId =
  | "correct"
  | "wrong"
  | "coin"
  | "pop"
  | "whoosh"
  | "snap"
  | "fanfare"
  | "level-up"
  | "star";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HowlInstance = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HowlerGlobal = any;

type SoundMap = Record<SoundId, HowlInstance | null>;

let sounds: SoundMap = {
  correct: null,
  wrong: null,
  coin: null,
  pop: null,
  whoosh: null,
  snap: null,
  fanfare: null,
  "level-up": null,
  star: null,
};

let initialised = false;
let _isMuted = false;
let _Howler: HowlerGlobal = null;

const SOUND_CONFIG: Record<SoundId, { src: string; volume: number }> = {
  correct: { src: "/sounds/correct.mp3", volume: 0.8 },
  wrong: { src: "/sounds/wrong.mp3", volume: 0.6 },
  coin: { src: "/sounds/coin.mp3", volume: 0.7 },
  pop: { src: "/sounds/pop.mp3", volume: 0.5 },
  whoosh: { src: "/sounds/whoosh.mp3", volume: 0.5 },
  snap: { src: "/sounds/snap.mp3", volume: 0.6 },
  fanfare: { src: "/sounds/fanfare.mp3", volume: 0.9 },
  "level-up": { src: "/sounds/level-up.mp3", volume: 0.9 },
  star: { src: "/sounds/star.mp3", volume: 0.7 },
};

/**
 * Pre-loads all sounds. Call once during app init (e.g. child home screen mount).
 * Safe to call multiple times — subsequent calls are no-ops.
 * Lazy-imports howler so it never runs in an SSR/Node.js context.
 */
export function initAudio(): void {
  if (initialised || typeof window === "undefined") return;
  initialised = true;

  // Dynamic require — only ever runs client-side
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Howl, Howler } = require("howler") as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Howl: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Howler: any;
  };
  _Howler = Howler;

  (Object.keys(SOUND_CONFIG) as SoundId[]).forEach((id) => {
    const { src, volume } = SOUND_CONFIG[id];
    sounds[id] = new Howl({
      src: [src],
      volume,
      preload: true,
      onloaderror: () => {
        sounds[id] = null;
      },
    });
  });
}

/**
 * Play a sound by ID. Respects global mute state.
 */
export function playSound(id: SoundId): number {
  if (_isMuted) return -1;
  const howl = sounds[id];
  if (!howl) return -1;
  return howl.play() as number;
}

export function setGlobalVolume(volume: number): void {
  if (_Howler) _Howler.volume(Math.min(1, Math.max(0, volume)));
}

export function setGlobalMute(muted: boolean): void {
  _isMuted = muted;
  if (_Howler) _Howler.mute(muted);
}

export function getGlobalMute(): boolean {
  return _isMuted;
}
