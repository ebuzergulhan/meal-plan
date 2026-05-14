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

  if (!plan) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-[#9090a8]">Yukleniyor...</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Alisveris Listesi</h1>
          <p className="mt-0.5 text-xs text-[#9090a8]">
            {checkedCount}/{totalItems} item tamamlandi
          </p>
        </div>
        <ShoppingCart size={20} className="text-[#a3e635]" />
      </div>

      {/* Progress */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#1e1e2a]">
        <div
          className="h-full rounded-full bg-[#a3e635] transition-all duration-300"
          style={{ width: totalItems ? `${(checkedCount / totalItems) * 100}%` : "0%" }}
        />
      </div>

      {/* Day tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setView("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === "all" ? "bg-[#a3e635] text-black" : "border border-[#1e1e2a] text-[#9090a8] hover:text-white"
          }`}
        >
          Haftalik
        </button>
        {plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setView(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === i ? "bg-[#a3e635] text-black" : "border border-[#1e1e2a] text-[#9090a8] hover:text-white"
            }`}
          >
            {DAY_SHORT[i]}
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
          className="flex-1 rounded-lg border border-[#1e1e2a] bg-[#111118] px-3 py-2.5 text-sm text-white placeholder-[#3f3f52] outline-none focus:border-[#a3e635]/50"
        />
        <button
          onClick={addCustom}
          className="rounded-lg bg-[#a3e635] px-3 py-2.5 text-black hover:bg-[#bef264] active:scale-95 transition-all"
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
              <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-widest text-[#a3e635]">
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
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#9090a8]">
              Urun adi
            </label>
            <input
              autoFocus
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#a3e635]/50"
            />
          </div>
          <div className="flex gap-2 border-t border-[#1e1e2a] pt-4">
            <button onClick={() => setEditModal(null)} className="flex-1 rounded-lg border border-[#1e1e2a] py-2.5 text-sm text-[#9090a8] hover:text-white transition-colors">
              Iptal
            </button>
            <button onClick={saveEdit} className="flex-1 rounded-lg bg-[#a3e635] py-2.5 text-sm font-bold text-black hover:bg-[#bef264] transition-all">
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
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#3f3f52]">{label}</p>
      <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] overflow-hidden divide-y divide-[#1e1e2a]">
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
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${checked ? "bg-[#a3e635]/5" : ""}`}>
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? "border-[#a3e635] bg-[#a3e635]" : "border-[#2a2a3a]"
        }`}
      >
        {checked && <Check size={11} className="text-black" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm transition-colors ${
          checked ? "line-through text-[#3f3f52]" : "text-white"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="rounded p-1 text-[#3f3f52] hover:text-[#9090a8] transition-colors">
          <Pencil size={12} />
        </button>
        <button onClick={onRemove} className="rounded p-1 text-[#3f3f52] hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
