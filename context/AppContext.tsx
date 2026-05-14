"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppState, Recipe, WeekPlan } from "@/lib/types";
import { generateWeekPlan, getWeekNum } from "@/lib/mealplan";

// Default recipes imported from data.json at build via API
const EMPTY_STATE: AppState = {
  recipes: null,
  weekPlan: null,
  shopChecks: {},
  shopCustom: {},
  shopEdits: {},
};

type Ctx = {
  state: AppState;
  loading: boolean;
  updateState: (patch: Partial<AppState>) => void;
  saveState: (patch: Partial<AppState>) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((data: AppState) => {
        // Ensure recipes are loaded; if not, use empty array so plan generation works
        const recipes = data.recipes ?? [];
        let weekPlan = data.weekPlan;
        // Regenerate plan if it's a different week
        if (!weekPlan || weekPlan.week !== getWeekNum()) {
          weekPlan = generateWeekPlan(recipes);
        }
        const newState = { ...data, recipes, weekPlan };
        setState(newState);
        // If plan was regenerated, persist it
        if (!data.weekPlan || data.weekPlan.week !== getWeekNum()) {
          persistState(newState);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const persistState = useCallback((s: AppState) => {
    fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    }).catch(console.error);
  }, []);

  const updateState = useCallback((patch: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveState = useCallback(
    (patch: Partial<AppState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => persistState(next), 400);
        return next;
      });
    },
    [persistState]
  );

  return (
    <AppCtx.Provider value={{ state, loading, updateState, saveState }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export function useRecipes(): Recipe[] {
  return useApp().state.recipes ?? [];
}

export function useWeekPlan(): WeekPlan | null {
  return useApp().state.weekPlan;
}
