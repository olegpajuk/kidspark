"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initTTS,
  speakWord,
  speakWordDouble,
  speakSentence,
  spellWord,
  cancelSpeech,
  isTTSSupported,
} from "@/lib/audio/tts";
import type { TTSRate } from "@/lib/audio/tts";

interface UseTTSReturn {
  speak: (text: string, rate?: TTSRate) => Promise<void>;
  speakDouble: (word: string) => Promise<void>;
  speakSentence: (text: string, rate?: TTSRate) => Promise<void>;
  spell: (word: string) => Promise<void>;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isTTSSupported());
    initTTS();
  }, []);

  const speak = useCallback(async (text: string, rate: TTSRate = "normal") => {
    setIsSpeaking(true);
    try {
      await speakWord(text, rate);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speakDouble = useCallback(async (word: string) => {
    setIsSpeaking(true);
    try {
      await speakWordDouble(word);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speakSentenceFn = useCallback(async (text: string, rate: TTSRate = "normal") => {
    setIsSpeaking(true);
    try {
      await speakSentence(text, rate);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const spell = useCallback(async (word: string) => {
    setIsSpeaking(true);
    try {
      await spellWord(word);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const cancel = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakDouble,
    speakSentence: speakSentenceFn,
    spell,
    cancel,
    isSpeaking,
    isSupported,
  };
}
