"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, X, Check, ShoppingCart } from "lucide-react";
import { useApp, useWeekPlan } from "@/context/AppContext";
import {
  buildShopSections,
  BASIC_ITEMS,
  encKey,
  type ShopSection,
} from "@/lib/shopping";
import Modal from "@/components/ui/Modal";

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function ShoppingPage() {
  const { state, saveState } = useApp();
  const plan = useWeekPlan();
  const { shopChecks, shopCustom, shopEdits } = state;

  const [view, setView] = useState<"all" | number>("all");
  const [newItem, setNewItem] = useState("");
  const [editModal, setEditModal] = useState<{
    uid: string;
    label: string;
    isCustom: boolean;
    customIdx?: number;
  } | null>(null);
  const [editVal, setEditVal] = useState("");

  const viewKey = view === "all" ? "all" : `day-${view}`;

  const sections = useMemo(() => {
    if (!plan) return [] as ShopSection[];
    return buildShopSections(plan.days, view === "all" ? null : view);
  }, [plan, view]);

  function toggle(uid: string) {
    const next = { ...shopChecks, [uid]: !shopChecks[uid] };
    saveState({ shopChecks: next });
  }

  function addCustom() {
    const val = newItem.trim();
    if (!val) return;
    const custom = { ...shopCustom };
    if (!custom[viewKey]) custom[viewKey] = [];
    custom[viewKey] = [...custom[viewKey], val];
    saveState({ shopCustom: custom });
    setNewItem("");
  }

  function removeCustom(idx: number) {
    const custom = { ...shopCustom };
    custom[viewKey] = [...(custom[viewKey] ?? [])];
    custom[viewKey].splice(idx, 1);
    saveState({ shopCustom: custom });
  }

  function hideItem(uid: string) {
    const edits = { ...shopEdits, [uid]: { ...(shopEdits[uid] ?? {}), hidden: true } };
    saveState({ shopEdits: edits });
  }

  function openEdit(uid: string, label: string, isCustom: boolean, customIdx?: number) {
    setEditVal(label);
    setEditModal({ uid, label, isCustom, customIdx });
  }

  function saveEdit() {
    if (!editModal) return;
    const clean = editVal.trim();
    if (!clean) return;
    if (editModal.isCustom && editModal.customIdx !== undefined) {
      const custom = { ...shopCustom };
      custom[viewKey] = [...(custom[viewKey] ?? [])];
      custom[viewKey][editModal.customIdx] = clean;
      saveState({ shopCustom: custom });
    } else {
      const edits = { ...shopEdits, [editModal.uid]: { ...(shopEdits[editModal.uid] ?? {}), label: clean } };
      saveState({ shopEdits: edits });
    }
    setEditModal(null);
  }

  const viewCustom = shopCustom[viewKey] ?? [];

  const totalItems =
    viewCustom.length +
    sections.reduce((sum, sec) => {
      if (sec.type === "basic") return sum + sec.items.filter((item) => !shopEdits[`basic-${encKey(item)}`]?.hidden).length;
      return sum + sec.slots.reduce((s2, slot) => s2 + slot.ings.filter((item) => !shopEdits[`r-${slot.dayIndex}-${slot.key}-${encKey(item)}`]?.hidden).length, 0);
    }, 0);

  const checkedCount = Object.values(shopChecks).filter(Boolean).length;

  if (!plan) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-slate-400">Yukleniyor...</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Alisveris Listesi</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {checkedCount}/{totalItems} item tamamlandi
          </p>
        </div>
        <ShoppingCart size={20} className="text-blue-500" />
      </div>

      {/* Progress */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full gradient-bg transition-all duration-300"
          style={{ width: totalItems ? `${(checkedCount / totalItems) * 100}%` : "0%" }}
        />
      </div>

      {/* Day tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setView("all")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === "all" ? "gradient-bg text-white shadow-sm" : "border border-slate-100 bg-slate-50 text-slate-500 hover:text-slate-700"
          }`}
        >
          Haftalik
        </button>
        {plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setView(i)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === i ? "gradient-bg text-white shadow-sm" : "border border-slate-100 bg-slate-50 text-slate-500 hover:text-slate-700"
            }`}
          >
            {DAY_SHORT[i]} {d.date.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Add custom item */}
      <div className="mb-5 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Ekstra urun ekle..."
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
        />
        <button
          onClick={addCustom}
          className="rounded-lg gradient-bg px-3 py-2.5 text-white hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Custom items */}
      {viewCustom.length > 0 && (
        <Section label="Ekstra Alisveris">
          {viewCustom.map((item, idx) => {
            const uid = `${viewKey}-custom-manual-${encKey(item)}-${idx}`;
            return (
              <ItemRow
                key={idx}
                uid={uid}
                label={item}
                checked={!!shopChecks[uid]}
                onToggle={() => toggle(uid)}
                onEdit={() => openEdit(uid, item, true, idx)}
                onRemove={() => removeCustom(idx)}
              />
            );
          })}
        </Section>
      )}

      {/* Auto sections */}
      {sections.map((sec, si) => {
        if (sec.type === "basic") {
          const visItems = sec.items.filter((item) => !shopEdits[`basic-${encKey(item)}`]?.hidden);
          if (!visItems.length) return null;
          return (
            <Section key={si} label="Temel Alisveris">
              {visItems.map((item) => {
                const uid = `basic-${encKey(item)}`;
                const label = shopEdits[uid]?.label ?? item;
                return (
                  <ItemRow
                    key={uid}
                    uid={uid}
                    label={label}
                    checked={!!shopChecks[uid]}
                    onToggle={() => toggle(uid)}
                    onEdit={() => openEdit(uid, label, false)}
                    onRemove={() => hideItem(uid)}
                  />
                );
              })}
            </Section>
          );
        }

        return (
          <div key={si}>
            {view === "all" && (
              <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                {sec.dayName}
              </p>
            )}
            {sec.slots.map((slot) => {
              const visIngs = slot.ings.filter(
                (item) => !shopEdits[`r-${slot.dayIndex}-${slot.key}-${encKey(item)}`]?.hidden
              );
              if (!visIngs.length) return null;
              return (
                <Section key={`${slot.dayIndex}-${slot.key}`} label={`${slot.mealName} · ${slot.label}`}>
                  {visIngs.map((item) => {
                    const uid = `r-${slot.dayIndex}-${slot.key}-${encKey(item)}`;
                    const label = shopEdits[uid]?.label ?? item;
                    return (
                      <ItemRow
                        key={uid}
                        uid={uid}
                        label={label}
                        checked={!!shopChecks[uid]}
                        onToggle={() => toggle(uid)}
                        onEdit={() => openEdit(uid, label, false)}
                        onRemove={() => hideItem(uid)}
                      />
                    );
                  })}
                </Section>
              );
            })}
          </div>
        );
      })}

      {/* Edit modal */}
      <Modal open={!!editModal} title="Urunu Duzenle" onClose={() => setEditModal(null)}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Urun adi
            </label>
            <input
              autoFocus
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <button onClick={() => setEditModal(null)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Iptal
            </button>
            <button onClick={saveEdit} className="flex-1 rounded-lg gradient-bg py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all">
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
}

function ItemRow({
  uid,
  label,
  checked,
  onToggle,
  onEdit,
  onRemove,
}: {
  uid: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${checked ? "bg-slate-50/80" : ""}`}>
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          checked ? "gradient-bg border-transparent" : "border-slate-200"
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm transition-colors ${
          checked ? "line-through text-slate-300" : "text-slate-700"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="rounded p-1 text-slate-300 hover:text-slate-500 transition-colors">
          <Pencil size={12} />
        </button>
        <button onClick={onRemove} className="rounded p-1 text-slate-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
