'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CameraState, ChatMessage } from '@/lib/types';

export type { CameraState };

// 뷰어 상태 타입
export interface ViewerStoreState {
  // 상태
  modelId: string;
  selectedPartId: string | null;
  explodeValue: number;
  cameraState: CameraState;
  notes: string;
  aiHistory: ChatMessage[];
  isHydrated: boolean;

  // 액션
  setModelId: (modelId: string) => void;
  setSelectedPartId: (partId: string | null) => void;
  setExplodeValue: (value: number) => void;
  setCameraState: (state: CameraState) => void;
  setNotes: (notes: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  clearChatHistory: () => void;
  resetState: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// 기본 카메라 상태
const defaultCameraState: CameraState = {
  position: [1, 0.5, 1],
  target: [0, 0, 0],
  zoom: 1,
};

// 기본 상태
const getDefaultState = () => ({
  modelId: '',
  selectedPartId: null,
  explodeValue: 0,
  cameraState: defaultCameraState,
  notes: '',
  aiHistory: [] as ChatMessage[],
  isHydrated: false,
});

// 모델별 스토어 캐시
const storeCache = new Map<string, ReturnType<typeof createViewerStore>>();

// 뷰어 스토어 생성 함수
function createViewerStore(modelId: string) {
  const store = create<ViewerStoreState>()(
    persist(
      (set) => ({
        ...getDefaultState(),
        modelId,

        setModelId: (modelId) => set({ modelId }),

        setSelectedPartId: (partId) => set({ selectedPartId: partId }),

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
          selectedPartId: state.selectedPartId,
          explodeValue: state.explodeValue,
          cameraState: state.cameraState,
          notes: state.notes,
          aiHistory: state.aiHistory,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Hydration error:', error);
          }
          // state가 undefined인 경우에도 store를 통해 직접 설정
          if (state) {
            state.setHydrated(true);
          } else {
            // fallback: store를 직접 업데이트
            store.setState({ isHydrated: true });
          }
        },
      }
    )
  );
  return store;
}

// 모델별 스토어 가져오기 (캐싱)
export function getViewerStore(modelId: string) {
  if (!storeCache.has(modelId)) {
    storeCache.set(modelId, createViewerStore(modelId));
  }
  return storeCache.get(modelId)!;
}

// 스토어 초기화 (테스트용)
export function clearViewerStoreCache() {
  storeCache.clear();
}

// 커스텀 훅: 모델별 뷰어 스토어 사용
export function useViewerStore(modelId: string) {
  const store = getViewerStore(modelId);
  return store;
}
