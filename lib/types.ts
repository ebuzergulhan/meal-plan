export type MealCat = "protein" | "light" | "balanced";

export type MealType =
  | "breakfast"
  | "dinner"
  | "kid-breakfast"
  | "kid-lunch"
  | "kid-dinner";

export type Recipe = {
  id: number;
  name: string;
  desc?: string;
  type: MealType;
  cat: MealCat;
  kid: boolean;
  we: boolean;
  servings?: string;
  ingredients?: string[];
  instructions?: string;
  notes?: string;
};

export type MealSlot = {
  main: Recipe;
  alts: Recipe[];
};

export type DayPlan = {
  day: string;
  date: string;
  isWe: boolean;
  bf: MealSlot;
  dn: MealSlot;
  kidS: MealSlot;
  kidL: MealSlot;
  kidD: MealSlot;
};

export type WeekPlan = {
  week: number;
  days: DayPlan[];
};

export type ShopEdits = Record<string, { label?: string; hidden?: boolean }>;

export type AppState = {
  recipes: Recipe[] | null;
  weekPlan: WeekPlan | null;
  shopChecks: Record<string, boolean>;
  shopCustom: Record<string, string[]>;
  shopEdits: ShopEdits;
};
