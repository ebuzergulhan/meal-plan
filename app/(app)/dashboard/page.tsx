"use client";

import { useState, useMemo } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, Repeat2 } from "lucide-react";
import { useApp, useRecipes, useWeekPlan } from "@/context/AppContext";
import { generateWeekPlan, getAltsFromPool, currentDayIndex } from "@/lib/mealplan";
import type { MealType, Recipe, DayPlan } from "@/lib/types";
import Modal from "@/components/ui/Modal";

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type SlotKey = "bf" | "dn" | "kidS" | "kidL" | "kidD";

const SLOT_META: { key: SlotKey; label: string; type: MealType }[] = [
  { key: "bf", label: "☀️ Kahvalti", type: "breakfast" },
  { key: "dn", label: "🌙 Aksam Yemegi", type: "dinner" },
  { key: "kidS", label: "🧒 Cocuk Sabah", type: "kid-breakfast" },
  { key: "kidL", label: "🧒 Cocuk Ogle", type: "kid-lunch" },
  { key: "kidD", label: "🧒 Cocuk Aksam", type: "kid-dinner" },
];

function tagColor(cat: string) {
  return cat === "protein"
    ? "bg-blue-50 text-blue-600"
    : cat === "light"
    ? "bg-emerald-50 text-emerald-600"
    : "bg-amber-50 text-amber-600";
}
function tagLabel(cat: string) {
  return cat === "protein" ? "Protein" : cat === "light" ? "Hafif" : "Dengeli";
}

type SwapModal = { dayIndex: number; slotKey: SlotKey; type: MealType } | null;
type EditModal = { dayIndex: number; slotKey: SlotKey; type: MealType } | null;

export default function DashboardPage() {
  const { saveState } = useApp();
  const recipes = useRecipes();
  const plan = useWeekPlan();
  const [activeDay, setActiveDay] = useState(currentDayIndex);
  const [swapModal, setSwapModal] = useState<SwapModal>(null);
  const [editModal, setEditModal] = useState<EditModal>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editSel, setEditSel] = useState<number | null>(null);

  const alts = useMemo(() => {
    if (!swapModal || !recipes.length) return [];
    return getAltsFromPool(recipes, swapModal.type, plan?.days[swapModal.dayIndex][swapModal.slotKey]?.main?.id ?? -1);
  }, [swapModal, recipes, plan]);

  const editPool = useMemo(() => {
    if (!editModal) return [];
    return recipes.filter((r) => r.type === editModal.type);
  }, [editModal, recipes]);

  const filteredEdit = useMemo(() => {
    const q = editSearch.toLowerCase();
    return q ? editPool.filter((r) => r.name.toLowerCase().includes(q) || (r.desc ?? "").toLowerCase().includes(q)) : editPool;
  }, [editPool, editSearch]);

  if (!plan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">Yukleniyor...</p>
      </div>
    );
  }

  function regenerate() {
    const newPlan = generateWeekPlan(recipes);
    saveState({ weekPlan: newPlan });
  }

  function swapMeal(dayIndex: number, slotKey: SlotKey, recipe: Recipe) {
    if (!plan) return;
    const newDays = plan.days.map((d, i) => {
      if (i !== dayIndex) return d;
      return { ...d, [slotKey]: { ...d[slotKey], main: recipe } };
    });
    saveState({ weekPlan: { ...plan, days: newDays } });
    setSwapModal(null);
  }

  function openEdit(dayIndex: number, slotKey: SlotKey, type: MealType) {
    const current = plan?.days[dayIndex]?.[slotKey]?.main;
    setEditSel(current?.id ?? null);
    setEditSearch("");
    setEditModal({ dayIndex, slotKey, type });
  }

  function saveEdit() {
    if (!editModal || editSel === null || !plan) return;
    const recipe = recipes.find((r) => r.id === editSel);
    if (!recipe) return;
    swapMeal(editModal.dayIndex, editModal.slotKey, recipe);
    setEditModal(null);
  }

  const day = plan.days[activeDay];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Haftalik Plan</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hafta {plan.week} &middot; {plan.days[0].date} – {plan.days[6].date}
          </p>
        </div>
        <button
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 hover:opacity-90 active:scale-95 transition-all"
        >
          <RefreshCw size={13} strokeWidth={2.5} />
          Yenile
        </button>
      </div>

      {/* Day selector */}
      <div className="mb-5 flex items-center gap-1">
        <button
          onClick={() => setActiveDay((d) => Math.max(0, d - 1))}
          disabled={activeDay === 0}
          className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="flex flex-1 gap-1 overflow-x-auto py-0.5 scrollbar-hide">
          {plan.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex shrink-0 flex-col items-center rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeDay === i
                  ? "gradient-bg text-white shadow-md shadow-blue-100"
                  : "border border-slate-100 bg-slate-50 text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className={`text-[9px] uppercase tracking-widest ${activeDay === i ? "opacity-70" : ""}`}>{DAY_SHORT[i]}</span>
              <span className="mt-0.5 text-sm">{d.date.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setActiveDay((d) => Math.min(6, d + 1))}
          disabled={activeDay === 6}
          className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${day.isWe ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
          {day.isWe ? "Hafta Sonu" : "Hafta Ici"}
        </span>
        <span className="text-xs text-slate-400">{day.day} · {day.date}</span>
      </div>

      {/* Meal slots */}
      <div className="space-y-3">
        {SLOT_META.map(({ key, label, type }) => {
          const slot = day[key];
          const m = slot?.main;
          if (!m) return null;
          return (
            <div key={key} className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 leading-snug">{m.name}</p>
                  {m.desc && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{m.desc}</p>}
                  {m.servings && <p className="mt-1 text-xs text-slate-400">Olcek: {m.servings}</p>}
                  {Array.isArray(m.ingredients) && m.ingredients.length > 0 && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                      🛒 {m.ingredients.join(", ")}
                    </p>
                  )}
                  {m.instructions && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">📋 {m.instructions}</p>
                  )}
                  <div className="mt-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${tagColor(m.cat)}`}>
                      {tagLabel(m.cat)}
                    </span>
                    {m.we && (
                      <span className="ml-1.5 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                        Hafta Sonu
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => openEdit(activeDay, key, type)}
                    className="rounded-xl border border-slate-100 p-2 text-slate-300 hover:border-blue-200 hover:text-blue-500 transition-colors"
                    title="Tarif sec"
                  >
                    <Repeat2 size={14} />
                  </button>
                </div>
              </div>

              {/* Alternatives */}
              {slot.alts && slot.alts.length > 0 && (
                <div className="mt-3 border-t border-slate-50 pt-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Diger secenekler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slot.alts.map((alt, ai) => (
                      <button
                        key={ai}
                        onClick={() => swapMeal(activeDay, key, alt)}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-blue-200 transition-colors"
                      >
                        {alt.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setSwapModal({ dayIndex: activeDay, slotKey: key, type })}
                      className="rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-xs text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                    >
                      Tumu...
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Swap all modal */}
      <Modal
        open={!!swapModal}
        title={`${swapModal ? SLOT_META.find((s) => s.key === swapModal.slotKey)?.label ?? "Degistir" : ""}`}
        onClose={() => setSwapModal(null)}
      >
        <div className="space-y-2">
          {alts.map((r) => (
            <button
              key={r.id}
              onClick={() => swapModal && swapMeal(swapModal.dayIndex, swapModal.slotKey, r)}
              className="flex w-full flex-col rounded-lg border border-slate-100 bg-slate-50 p-3 text-left hover:border-blue-200 transition-colors"
            >
              <span className="font-semibold text-slate-900 text-sm">{r.name}</span>
              {r.desc && <span className="mt-0.5 text-xs text-slate-500">{r.desc}</span>}
            </button>
          ))}
          {alts.length === 0 && <p className="text-sm text-slate-400">Bu kategoride baska tarif yok.</p>}
        </div>
      </Modal>

      {/* Edit / pick meal modal */}
      <Modal
        open={!!editModal}
        title={editModal ? `${plan.days[editModal.dayIndex].day} – ${SLOT_META.find((s) => s.key === editModal.slotKey)?.label ?? ""}` : ""}
        onClose={() => setEditModal(null)}
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tarif ara..."
            value={editSearch}
            onChange={(e) => setEditSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
          />
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredEdit.map((r) => (
              <button
                key={r.id}
                onClick={() => setEditSel(r.id)}
                className={`flex w-full flex-col rounded-lg border p-3 text-left transition-colors ${
                  editSel === r.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <span className="font-semibold text-slate-900 text-sm">{r.name}</span>
                {r.desc && <span className="mt-0.5 text-xs text-slate-500">{r.desc}</span>}
              </button>
            ))}
            {filteredEdit.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Sonuc bulunamadi</p>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setEditModal(null)}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={saveEdit}
              disabled={editSel === null}
              className="flex-1 rounded-lg gradient-bg py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
