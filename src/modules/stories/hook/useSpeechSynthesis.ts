import { useEffect, useRef, useState, useCallback } from "react";

interface SpeakOptions {
  text: string;
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const optionsRef = useRef<Omit<SpeakOptions, "text">>({});

  // Detect support and fetch voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSupported(true);
      
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    chunksRef.current = [];
    currentChunkIndexRef.current = 0;
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }
  }, []);

  // Split text by punctuation and newlines into smaller chunks
  const splitText = (text: string): string[] => {
    // Split by end of sentence or newlines
    const regex = /[^.!?\s][^.!?\n]*[.!?]?|\n+/gi;
    const parts = text.match(regex) || [text];
    const result: string[] = [];
    
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      
      // If a part is too long, split by comma or spaces
      if (part.length > 200) {
        const subParts = part.split(/(?<=[,;])\s+/);
        for (let subPart of subParts) {
          subPart = subPart.trim();
          if (!subPart) continue;
          
          if (subPart.length > 200) {
            // Split by words
            const words = subPart.split(/\s+/);
            let current = "";
            for (const word of words) {
              if ((current + " " + word).length > 200) {
                result.push(current.trim());
                current = word;
              } else {
                current += (current ? " " : "") + word;
              }
            }
            if (current.trim()) result.push(current.trim());
          } else {
            result.push(subPart);
          }
        }
      } else {
        result.push(part);
      }
    }
    return result;
  };

  const speakNext = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (currentChunkIndexRef.current >= chunksRef.current.length) {
      // Finished all chunks
      setSpeaking(false);
      return;
    }

    const chunkText = chunksRef.current[currentChunkIndexRef.current];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utteranceRef.current = utterance;

    // Apply voice, rate, pitch, volume
    const { voice, rate = 1, pitch = 1, volume = 1 } = optionsRef.current;
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => {
      currentChunkIndexRef.current += 1;
      speakNext();
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      // If error is not 'interrupted', reset speaking state
      if (event.error !== "interrupted") {
        cancel();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [cancel]);

  const speak = useCallback(
    ({ text, voice, rate = 1, pitch = 1, volume = 1 }: SpeakOptions) => {
      if (!window.speechSynthesis) return;

      // Always cancel any ongoing speech first to avoid bugs
      window.speechSynthesis.cancel();

      if (!text) return;

      const chunks = splitText(text);
      if (chunks.length === 0) return;

      chunksRef.current = chunks;
      currentChunkIndexRef.current = 0;
      optionsRef.current = { voice, rate, pitch, volume };

      setSpeaking(true);
      speakNext();
    },
    [speakNext]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    supported,
    speak,
    speaking,
    cancel,
    voices,
  };
}
