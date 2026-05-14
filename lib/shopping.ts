import type { DayPlan, Recipe } from "./types";

type ShopSections = {
  Protein: Set<string>;
  BaklaTahil: Set<string>;
  SebzeMeyve: Set<string>;
  Diger: Set<string>;
};

function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function addItemsForNames(items: ShopSections, names: string) {
  const n = names.toLowerCase();
  if (n.includes("yumurta") || n.includes("omlet") || n.includes("menemen")) items.Protein.add("Yumurta");
  if (n.includes("tavuk")) items.Protein.add("Tavuk (500g)");
  if (n.includes("kiyma") || (n.includes("kofte") && !n.includes("mercimek kofte"))) items.Protein.add("Kiyma (500g)");
  if (hasAny(n, ["kusbasi", "et sote", "etli", "tandir", "ali nazik", "kuzu"])) items.Protein.add("Kusbasi et (500g)");
  if (n.includes("balik") || n.includes("somon") || n.includes("levrek")) items.Protein.add("Balik (2 porsiyon)");
  if (n.includes("karides")) items.Protein.add("Karides (300g)");
  if (n.includes("sucuk")) items.Protein.add("Sucuk (200g)");
  if (n.includes("kasar")) items.Protein.add("Kasar peynir (200g)");
  if (n.includes("lor")) items.Protein.add("Lor peyniri (200g)");
  if (n.includes("bulgur")) items.BaklaTahil.add("Bulgur (500g)");
  if (n.includes("pirinc")) items.BaklaTahil.add("Pirinc (500g)");
  if (n.includes("makarna")) items.BaklaTahil.add("Makarna (500g)");
  if (n.includes("fasulye")) items.BaklaTahil.add("Kuru fasulye (500g)");
  if (n.includes("mercimek")) items.BaklaTahil.add("Kirmizi mercimek (500g)");
  if (n.includes("nohut")) items.BaklaTahil.add("Nohut (500g)");
  if (n.includes("yulaf")) items.BaklaTahil.add("Yulaf (300g)");
  if (n.includes("gozleme") || n.includes("borek")) items.BaklaTahil.add("Yufka (4 adet)");
  if (n.includes("ispanak")) items.SebzeMeyve.add("Ispanak (500g)");
  if (n.includes("patlican") || n.includes("karniyarik")) items.SebzeMeyve.add("Patlican (4 adet)");
  if (n.includes("patates")) items.SebzeMeyve.add("Patates (1kg)");
  if (n.includes("havuc")) items.SebzeMeyve.add("Havuc (500g)");
  if (n.includes("kabak")) items.SebzeMeyve.add("Kabak (500g)");
  if (n.includes("biber")) items.SebzeMeyve.add("Biber (500g)");
  if (n.includes("avokado")) items.SebzeMeyve.add("Avokado (2 adet)");
  if (hasAny(n, ["marul", "salata", "roka"])) items.SebzeMeyve.add("Marul/Roka (1 bag)");
  if (n.includes("limon")) items.SebzeMeyve.add("Limon (3 adet)");
  if (n.includes("mantar")) items.SebzeMeyve.add("Mantar (300g)");
  if (n.includes("bamya")) items.SebzeMeyve.add("Bamya (500g)");
  if (n.includes("bal")) items.Diger.add("Bal");
  if (n.includes("ceviz")) items.Diger.add("Ceviz (200g)");
  if (n.includes("ayran")) items.Diger.add("Ayran (1L)");
  if (n.includes("sut") || n.includes("yulaf")) items.Diger.add("Sut (1L)");
  if (n.includes("salca")) items.Diger.add("Salca");
  if (n.includes("granola")) items.Diger.add("Granola");
  if (n.includes("tahin")) items.Diger.add("Tahin");
}

function addIngredientItem(items: ShopSections, line: string) {
  const clean = String(line || "").trim();
  if (!clean) return;
  const text = clean.toLowerCase();
  let cat: keyof ShopSections = "Diger";
  if (hasAny(text, ["tavuk", "kiyma", "kofte", "balik", "somon", "karides", "sucuk", "peynir", "kasar", "lor", "yumurta", "yogurt", "dana", "kuzu", "hindi"])) cat = "Protein";
  else if (hasAny(text, ["domates", "salatalik", "patlican", "patates", "havuc", "kabak", "biber", "avokado", "marul", "roka", "limon", "sarimsak", "mantar", "bamya", "ispanak", "muz", "elma", "portakal"])) cat = "SebzeMeyve";
  else if (hasAny(text, ["bulgur", "pirinc", "makarna", "fasulye", "mercimek", "nohut", "yulaf", "yufka", "ekmek", "un ", "irmik", "sehriye", "granola", "gevrek"])) cat = "BaklaTahil";
  items[cat].add(clean);
}

export function getMealIngredients(recipe: Recipe | null | undefined): string[] {
  if (!recipe) return [];
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) return recipe.ingredients;
  const items: ShopSections = { Protein: new Set(), BaklaTahil: new Set(), SebzeMeyve: new Set(), Diger: new Set() };
  const text = [recipe.name, recipe.desc, recipe.instructions, recipe.notes].filter(Boolean).join(" ").toLowerCase();
  addItemsForNames(items, text);
  return [...items.Protein, ...items.BaklaTahil, ...items.SebzeMeyve, ...items.Diger];
}

export type ShopSection =
  | { type: "basic"; items: string[] }
  | { type: "day"; dayName: string; dayIndex: number; slots: ShopSlot[] };

export type ShopSlot = {
  key: string;
  label: string;
  mealName: string;
  dayIndex: number;
  ings: string[];
};

const MEAL_SLOT_LABELS: Record<string, string> = {
  bf: "Kahvalti",
  dn: "Aksam",
  kidS: "Cocuk Sabah",
  kidL: "Cocuk Ogle",
  kidD: "Cocuk Aksam",
};

export const BASIC_ITEMS = [
  "Beyaz peynir (250g)", "Yogurt (1kg)", "Domates (1kg)", "Salatalik (500g)",
  "Muz (3-4 adet)", "Mevsim meyvesi", "Sogan (500g)", "Maydanoz (1 demet)",
  "Ekmek (gunluk)", "Tost ekmegi", "Zeytinyag", "Tereyag", "Zeytin", "Cay",
];

export function buildShopSections(days: DayPlan[], dayIndex: number | null): ShopSection[] {
  const sections: ShopSection[] = [];
  const isAll = dayIndex === null;

  if (isAll) sections.push({ type: "basic", items: BASIC_ITEMS });

  const dayList = isAll ? days.map((d, i) => ({ d, i })) : [{ d: days[dayIndex!], i: dayIndex! }];

  dayList.forEach(({ d, i }) => {
    const slots: ShopSlot[] = [];
    Object.entries(MEAL_SLOT_LABELS).forEach(([key, label]) => {
      const meal = (d as unknown as Record<string, { main: Recipe }>)[key];
      if (!meal?.main) return;
      const ings = getMealIngredients(meal.main);
      if (!ings.length) return;
      slots.push({ key, label, mealName: meal.main.name, dayIndex: i, ings });
    });
    if (slots.length) sections.push({ type: "day", dayName: d.day, dayIndex: i, slots });
  });

  return sections;
}

export function encKey(v: string): string {
  return encodeURIComponent(v).replace(/'/g, "%27");
}

export function shopUid(
  viewKey: string,
  kind: string,
  cat: string,
  item: string,
  idx?: number
): string {
  if (kind === "auto") return [kind, cat, encKey(item)].join("-");
  return [viewKey, kind, cat, encKey(item), idx ?? ""].join("-");
}
