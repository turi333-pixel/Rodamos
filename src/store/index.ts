"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RouteInput,
  AnalysisResult,
  AnalysisStatus,
  AppView,
  SavedRoute,
  UserProfile,
} from "@/types";

interface AppStore {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Route Input
  routeInput: Partial<RouteInput>;
  setRouteInput: (input: Partial<RouteInput>) => void;
  clearRouteInput: () => void;

  // Analysis
  analysisStatus: AnalysisStatus;
  analysisResult: AnalysisResult | null;
  analysisError: string | null;
  streamingText: string;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysisError: (error: string | null) => void;
  appendStreamingText: (text: string) => void;
  clearStreaming: () => void;

  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // History & Favorites
  history: SavedRoute[];
  favorites: SavedRoute[];
  addToHistory: (route: SavedRoute) => void;
  toggleFavorite: (id: string) => void;
  setHistory: (routes: SavedRoute[]) => void;

  // UI State
  mapExpanded: boolean;
  setMapExpanded: (expanded: boolean) => void;
  activeCard: string | null;
  setActiveCard: (card: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentView: "home",
      setView: (view) => set({ currentView: view }),

      routeInput: {},
      setRouteInput: (input) =>
        set((s) => ({ routeInput: { ...s.routeInput, ...input } })),
      clearRouteInput: () => set({ routeInput: {} }),

      analysisStatus: "idle",
      analysisResult: null,
      analysisError: null,
      streamingText: "",
      setAnalysisStatus: (status) => set({ analysisStatus: status }),
      setAnalysisResult: (result) => set({ analysisResult: result }),
      setAnalysisError: (error) => set({ analysisError: error }),
      appendStreamingText: (text) =>
        set((s) => ({ streamingText: s.streamingText + text })),
      clearStreaming: () => set({ streamingText: "" }),

      user: null,
      setUser: (user) => set({ user }),

      history: [],
      favorites: [],
      addToHistory: (route) =>
        set((s) => ({ history: [route, ...s.history].slice(0, 50) })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.find((f) => f.id === id)
            ? s.favorites.filter((f) => f.id !== id)
            : [...s.favorites, s.history.find((h) => h.id === id)!].filter(Boolean),
          history: s.history.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          ),
        })),
      setHistory: (routes) => set({ history: routes }),

      mapExpanded: false,
      setMapExpanded: (expanded) => set({ mapExpanded: expanded }),
      activeCard: null,
      setActiveCard: (card) => set({ activeCard: card }),
    }),
    {
      name: "rodamos-store",
      partialize: (s) => ({
        history: s.history.slice(0, 20),
        favorites: s.favorites,
        user: s.user,
      }),
    }
  )
);
