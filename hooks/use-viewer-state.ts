'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ChatMessage, ViewerState } from '@/lib/types';

const STORAGE_PREFIX = 'simvex_';

const defaultState: Omit<ViewerState, 'modelId'> = {
  camera: {
    position: [5, 3, 5],
    rotation: [0, 0, 0],
    zoom: 1,
  },
  explodeValue: 0,
  selectedPartId: null,
  notes: '',
  aiHistory: [],
};

export function useViewerState(modelId: string) {
  const [state, setState] = useState<ViewerState>({
    modelId,
    ...defaultState,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${modelId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ViewerState;
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse stored state:', e);
      }
    }
    setIsLoaded(true);
  }, [modelId]);

  // Save to localStorage on state change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        `${STORAGE_PREFIX}${modelId}`,
        JSON.stringify(state)
      );
    }
  }, [state, modelId, isLoaded]);

  const setExplodeValue = useCallback((value: number) => {
    setState((prev) => ({ ...prev, explodeValue: value }));
  }, []);

  const setSelectedPartId = useCallback((partId: string | null) => {
    setState((prev) => ({ ...prev, selectedPartId: partId }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  const addChatMessage = useCallback(
    (message: Omit<ChatMessage, 'timestamp'>) => {
      setState((prev) => ({
        ...prev,
        aiHistory: [...prev.aiHistory, { ...message, timestamp: Date.now() }],
      }));
    },
    []
  );

  const clearChatHistory = useCallback(() => {
    setState((prev) => ({ ...prev, aiHistory: [] }));
  }, []);

  return {
    state,
    isLoaded,
    setExplodeValue,
    setSelectedPartId,
    setNotes,
    addChatMessage,
    clearChatHistory,
  };
}
