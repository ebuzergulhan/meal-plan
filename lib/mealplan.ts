import type { Recipe, MealSlot, DayPlan, WeekPlan, MealType } from "./types";

const DAY_NAMES = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];

export function getWeekNum(): number {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
}

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function pickOne<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateWeekPlan(recipes: Recipe[]): WeekPlan {
  const today = new Date();
  const monday = new Date(today);
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  monday.setDate(today.getDate() - dow);

  const days: DayPlan[] = DAY_NAMES.map((dayName, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const isWe = i >= 5;

    const pool = (type: MealType) =>
      recipes.filter((r) => r.type === type && (isWe ? r.we || !r.we : !r.we || r.we));

    const slot = (type: MealType, altCount: number): MealSlot => {
      const p = pool(type);
      const main = pickOne(p) ?? ({ id: 0, name: "-", type, cat: "balanced", kid: false, we: false } as Recipe);
      const alts = pick(p.filter((r) => r.id !== main.id), altCount);
      return { main, alts };
    };

    return {
      day: dayName,
      date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }),
      isWe,
      bf: slot("breakfast", 3),
      dn: slot("dinner", 3),
      kidS: slot("kid-breakfast", 2),
      kidL: slot("kid-lunch", 2),
      kidD: slot("kid-dinner", 2),
    };
  });

  return { week: getWeekNum(), days };
}

export function getAltsFromPool(
  recipes: Recipe[],
  type: MealType,
  excludeId: number
): Recipe[] {
  const pool = recipes.filter((r) => r.type === type && r.id !== excludeId);
  return pick(pool, type.startsWith("kid") ? 2 : 3);
}

export function currentDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
