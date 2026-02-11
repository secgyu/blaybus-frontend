'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Quiz, QuizResultResponse } from '@/types/api';
import type { CameraState, ChatMessage } from '@/types/viewer';

export type { CameraState };

export interface ViewerStoreState {
  modelId: string;
  selectedPartIds: string[];
  explodeValue: number;
  cameraState: CameraState | null;
  notes: string;
  aiHistory: ChatMessage[];
  quizQuestions: Quiz[];
  quizResults: QuizResultResponse | null;
  isHydrated: boolean;

  setModelId: (modelId: string) => void;
  toggleSelectedPartId: (partId: string) => void;
  clearSelectedPartIds: () => void;
  setExplodeValue: (value: number) => void;
  setCameraState: (state: CameraState) => void;
  setNotes: (notes: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  clearChatHistory: () => void;
  setQuizQuestions: (quizzes: Quiz[]) => void;
  setQuizResults: (results: QuizResultResponse | null) => void;
  resetState: () => void;
  setHydrated: (hydrated: boolean) => void;
}

const getDefaultState = () => ({
  modelId: '',
  selectedPartIds: [] as string[],
  explodeValue: 0,
  cameraState: null as CameraState | null,
  notes: '',
  aiHistory: [] as ChatMessage[],
  quizQuestions: [] as Quiz[],
  quizResults: null as QuizResultResponse | null,
  isHydrated: false,
});

const storeCache = new Map<string, ReturnType<typeof createViewerStore>>();

function createViewerStore(modelId: string) {
  const store = create<ViewerStoreState>()(
    persist(
      (set) => ({
        ...getDefaultState(),
        modelId,

        setModelId: (modelId) => set({ modelId }),

        toggleSelectedPartId: (partId) =>
          set((state) => {
            const exists = state.selectedPartIds.includes(partId);
            return {
              selectedPartIds: exists
                ? state.selectedPartIds.filter((id) => id !== partId)
                : [...state.selectedPartIds, partId],
            };
          }),

        clearSelectedPartIds: () => set({ selectedPartIds: [] }),

        setExplodeValue: (value) => set({ explodeValue: value }),

        setCameraState: (state) => set({ cameraState: state }),

        setNotes: (notes) => set({ notes }),

        addChatMessage: (message) =>
          set((state) => ({
            aiHistory: [
              ...state.aiHistory,
              { ...message, timestamp: Date.now() },
            ],
          })),

        clearChatHistory: () => set({ aiHistory: [] }),

        setQuizQuestions: (quizzes) => set({ quizQuestions: quizzes }),

        setQuizResults: (results) => set({ quizResults: results }),

        resetState: () =>
          set({
            ...getDefaultState(),
            modelId,
          }),

        setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      }),
      {
        name: `simvex_viewer_${modelId}`,
        partialize: (state) => ({
          selectedPartIds: state.selectedPartIds,
          explodeValue: state.explodeValue,
          cameraState: state.cameraState,
          notes: state.notes,
          aiHistory: state.aiHistory,
          quizQuestions: state.quizQuestions,
          quizResults: state.quizResults,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Hydration error:', error);
          }
          if (state) {
            state.setHydrated(true);
          } else {
            store.setState({ isHydrated: true });
          }
        },
      }
    )
  );
  return store;
}

export function getViewerStore(modelId: string) {
  if (!storeCache.has(modelId)) {
    storeCache.set(modelId, createViewerStore(modelId));
  }
  return storeCache.get(modelId)!;
}

export function removeViewerStoreCache(modelId: string) {
  storeCache.delete(modelId);
}

export function clearViewerStoreCache() {
  storeCache.clear();
}

export function useViewerStore(modelId: string) {
  const store = getViewerStore(modelId);
  return store;
}
