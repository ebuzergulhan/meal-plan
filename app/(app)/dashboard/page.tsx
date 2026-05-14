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
    ? "bg-blue-500/10 text-blue-400"
    : cat === "light"
    ? "bg-emerald-500/10 text-emerald-400"
    : "bg-amber-500/10 text-amber-400";
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
        <p className="text-[#9090a8]">Yukleniyor...</p>
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
          <h1 className="text-xl font-extrabold text-white">Haftalik Plan</h1>
          <p className="text-xs text-[#9090a8] mt-0.5">
            Hafta {plan.week} &middot; {plan.days[0].date} – {plan.days[6].date}
          </p>
        </div>
        <button
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-3 py-2 text-xs font-bold text-black hover:bg-[#bef264] active:scale-95 transition-all"
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
          className="rounded-lg border border-[#1e1e2a] p-2 text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="flex flex-1 gap-1 overflow-x-auto py-0.5 scrollbar-hide">
          {plan.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                activeDay === i
                  ? "bg-[#a3e635] text-black"
                  : "border border-[#1e1e2a] text-[#9090a8] hover:text-white"
              }`}
            >
              <span className="text-[9px] uppercase tracking-widest opacity-70">{DAY_SHORT[i]}</span>
              <span className="mt-0.5 text-sm">{i + 1}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setActiveDay((d) => Math.min(6, d + 1))}
          disabled={activeDay === 6}
          className="rounded-lg border border-[#1e1e2a] p-2 text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${day.isWe ? "bg-[#a3e635]/10 text-[#a3e635]" : "bg-[#1e1e2a] text-[#9090a8]"}`}>
          {day.isWe ? "Hafta Sonu" : "Hafta Ici"}
        </span>
        <span className="text-xs text-[#9090a8]">{day.day} · {day.date}</span>
      </div>

      {/* Meal slots */}
      <div className="space-y-3">
        {SLOT_META.map(({ key, label, type }) => {
          const slot = day[key];
          const m = slot?.main;
          if (!m) return null;
          return (
            <div key={key} className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#3f3f52]">{label}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white leading-snug">{m.name}</p>
                  {m.desc && <p className="mt-0.5 text-xs text-[#9090a8] line-clamp-2">{m.desc}</p>}
                  {m.servings && <p className="mt-1 text-xs text-[#3f3f52]">Olcek: {m.servings}</p>}
                  {Array.isArray(m.ingredients) && m.ingredients.length > 0 && (
                    <p className="mt-1 text-xs text-[#3f3f52] line-clamp-1">
                      🛒 {m.ingredients.join(", ")}
                    </p>
                  )}
                  {m.instructions && (
                    <p className="mt-1 text-xs text-[#3f3f52] line-clamp-2">📋 {m.instructions}</p>
                  )}
                  <div className="mt-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagColor(m.cat)}`}>
                      {tagLabel(m.cat)}
                    </span>
                    {m.we && (
                      <span className="ml-1.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                        Hafta Sonu
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => openEdit(activeDay, key, type)}
                    className="rounded-lg border border-[#1e1e2a] p-2 text-[#9090a8] hover:border-[#a3e635]/40 hover:text-[#a3e635] transition-colors"
                    title="Tarif sec"
                  >
                    <Repeat2 size={14} />
                  </button>
                </div>
              </div>

              {/* Alternatives */}
              {slot.alts && slot.alts.length > 0 && (
                <div className="mt-3 border-t border-[#1e1e2a] pt-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#3f3f52]">
                    Diger secenekler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slot.alts.map((alt, ai) => (
                      <button
                        key={ai}
                        onClick={() => swapMeal(activeDay, key, alt)}
                        className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-1.5 text-xs text-[#9090a8] hover:border-[#a3e635]/30 hover:text-white transition-colors"
                      >
                        {alt.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setSwapModal({ dayIndex: activeDay, slotKey: key, type })}
                      className="rounded-lg border border-dashed border-[#2a2a3a] px-3 py-1.5 text-xs text-[#3f3f52] hover:border-[#a3e635]/30 hover:text-[#a3e635] transition-colors"
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
              className="flex w-full flex-col rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3 text-left hover:border-[#a3e635]/30 transition-colors"
            >
              <span className="font-semibold text-white text-sm">{r.name}</span>
              {r.desc && <span className="mt-0.5 text-xs text-[#9090a8]">{r.desc}</span>}
            </button>
          ))}
          {alts.length === 0 && <p className="text-sm text-[#9090a8]">Bu kategoride baska tarif yok.</p>}
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
            className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder-[#3f3f52] outline-none focus:border-[#a3e635]/50"
          />
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredEdit.map((r) => (
              <button
                key={r.id}
                onClick={() => setEditSel(r.id)}
                className={`flex w-full flex-col rounded-lg border p-3 text-left transition-colors ${
                  editSel === r.id
                    ? "border-[#a3e635]/50 bg-[#a3e635]/5"
                    : "border-[#1e1e2a] bg-[#0a0a0f] hover:border-[#2a2a3a]"
                }`}
              >
                <span className="font-semibold text-white text-sm">{r.name}</span>
                {r.desc && <span className="mt-0.5 text-xs text-[#9090a8]">{r.desc}</span>}
              </button>
            ))}
            {filteredEdit.length === 0 && (
              <p className="py-4 text-center text-sm text-[#9090a8]">Sonuc bulunamadi</p>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-[#1e1e2a]">
            <button
              onClick={() => setEditModal(null)}
              className="flex-1 rounded-lg border border-[#1e1e2a] py-2.5 text-sm text-[#9090a8] hover:text-white transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={saveEdit}
              disabled={editSel === null}
              className="flex-1 rounded-lg bg-[#a3e635] py-2.5 text-sm font-bold text-black hover:bg-[#bef264] disabled:opacity-40 transition-all"
            >
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
