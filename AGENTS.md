'use client';

import { useState, useEffect, useCallback } from 'react';

const MEMORY_KEY = 'promptr_context_memory';
const GHOST_FILL_THRESHOLD = 3;

interface MemoryRecord {
  [category: string]: {
    [chipValue: string]: number; // count of times selected
  };
}

export function useContextMemory() {
  const [memory, setMemory] = useState<MemoryRecord>({});
  const [ghostFilledDefaults, setGhostFilledDefaults] = useState<Record<string, string[]>>({});

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MemoryRecord;
        setMemory(parsed);
        
        // Calculate ghost fills
        const defaults: Record<string, string[]> = {};
        for (const [category, chips] of Object.entries(parsed)) {
          defaults[category] = [];
          for (const [chip, count] of Object.entries(chips)) {
            if (count >= GHOST_FILL_THRESHOLD) {
              defaults[category].push(chip);
            }
          }
        }
        setGhostFilledDefaults(defaults);
      }
    } catch (e) {
      console.warn('Failed to load context memory', e);
    }
  }, []);

  // Update memory when user submits context
  const recordSelections = useCallback((selections: Record<string, string[]>) => {
    setMemory((prev) => {
      const newMemory = { ...prev };
      
      for (const [category, chips] of Object.entries(selections)) {
        if (!newMemory[category]) {
          newMemory[category] = {};
        }
        for (const chip of chips) {
          if (!chip.trim()) continue;
          newMemory[category][chip] = (newMemory[category][chip] || 0) + 1;
        }
      }

      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(newMemory));
      } catch (e) {
        console.warn('Failed to save context memory', e);
      }

      // Re-calculate defaults
      const defaults: Record<string, string[]> = {};
      for (const [category, chipsMap] of Object.entries(newMemory)) {
        defaults[category] = [];
        for (const [chip, count] of Object.entries(chipsMap)) {
          if (count >= GHOST_FILL_THRESHOLD) {
            defaults[category].push(chip);
          }
        }
      }
      setGhostFilledDefaults(defaults);

      return newMemory;
    });
  }, []);

  return {
    ghostFilledDefaults,
    recordSelections,
  };
}
