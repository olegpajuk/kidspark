"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initAudio,
  playSound as playSoundFn,
  setGlobalMute,
  getGlobalMute,
} from "@/lib/audio/sounds";
import type { SoundId } from "@/lib/audio/sounds";

/**
 * Hook that provides audio playback capabilities.
 *
 * - Initialises Howler on first call (client-side only).
 * - Exposes `playSound`, `isMuted`, and `toggleMute`.
 * - Reads initial mute state from localStorage so the preference persists
 *   across sessions without needing Firestore for this low-priority setting.
 */
export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    initAudio();

    // Restore persisted mute preference
    try {
      const stored = localStorage.getItem("audio-muted");
      if (stored === "true") {
        setGlobalMute(true);
        setIsMuted(true);
      }
    } catch {
      // localStorage unavailable (SSR / private browsing)
    }
  }, []);

  const playSound = useCallback((id: SoundId) => {
    playSoundFn(id);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setGlobalMute(next);
      try {
        localStorage.setItem("audio-muted", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const mute = useCallback(() => {
    setGlobalMute(true);
    setIsMuted(true);
    try {
      localStorage.setItem("audio-muted", "true");
    } catch {
      /* ignore */
    }
  }, []);

  const unmute = useCallback(() => {
    setGlobalMute(false);
    setIsMuted(false);
    try {
      localStorage.setItem("audio-muted", "false");
    } catch {
      /* ignore */
    }
  }, []);

  return { playSound, isMuted, toggleMute, mute, unmute };
}

export type { SoundId };
