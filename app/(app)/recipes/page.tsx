"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useApp, useRecipes } from "@/context/AppContext";
import Modal from "@/components/ui/Modal";
import type { MealCat, MealType, Recipe } from "@/lib/types";

const TYPES: { value: MealType | "all"; label: string }[] = [
  { value: "all", label: "Tumu" },
  { value: "breakfast", label: "Kahvalti" },
  { value: "dinner", label: "Aksam" },
  { value: "kid-breakfast", label: "Cocuk Sabah" },
  { value: "kid-lunch", label: "Cocuk Ogle" },
  { value: "kid-dinner", label: "Cocuk Aksam" },
];

const TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Kahvalti",
  dinner: "Aksam",
  "kid-breakfast": "C.Sabah",
  "kid-lunch": "C.Ogle",
  "kid-dinner": "C.Aksam",
};

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

type FormState = {
  name: string;
  desc: string;
  servings: string;
  ingredients: string;
  instructions: string;
  notes: string;
  type: MealType;
  cat: MealCat;
  we: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  desc: "",
  servings: "",
  ingredients: "",
  instructions: "",
  notes: "",
  type: "breakfast",
  cat: "protein",
  we: false,
});

function recipeToForm(r: Recipe): FormState {
  return {
    name: r.name,
    desc: r.desc ?? "",
    servings: r.servings ?? "",
    ingredients: Array.isArray(r.ingredients) ? r.ingredients.join("\n") : "",
    instructions: r.instructions ?? "",
    notes: r.notes ?? "",
    type: r.type,
    cat: r.cat,
    we: r.we,
  };
}

function formToRecipe(f: FormState, id: number): Recipe {
  return {
    id,
    name: f.name.trim(),
    desc: f.desc.trim(),
    servings: f.servings.trim(),
    ingredients: f.ingredients.split("\n").map((l) => l.trim()).filter(Boolean),
    instructions: f.instructions.trim(),
    notes: f.notes.trim(),
    type: f.type,
    cat: f.cat,
    kid: f.type.startsWith("kid"),
    we: f.we,
  };
}

export default function RecipesPage() {
  const { saveState } = useApp();
  const recipes = useRecipes();
  const [filter, setFilter] = useState<MealType | "all">("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipes.filter((r) => {
      const matchType = filter === "all" || r.type === filter;
      const matchSearch = !q || r.name.toLowerCase().includes(q) || (r.desc ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [recipes, filter, search]);

  function openAdd() {
    setForm(emptyForm());
    setFormError("");
    setModal("add");
  }

  function openEdit(r: Recipe) {
    setEditId(r.id);
    setForm(recipeToForm(r));
    setFormError("");
    setModal("edit");
  }

  function openDelete(id: number) {
    setDeleteId(id);
    setModal("delete");
  }

  function handleSave() {
    if (!form.name.trim()) {
      setFormError("Tarif adi gerekli");
      return;
    }
    const maxId = recipes.reduce((m, r) => Math.max(m, r.id), 0);
    const newRecipe = formToRecipe(form, maxId + 1);
    saveState({ recipes: [...recipes, newRecipe] });
    setModal(null);
  }

  function handleUpdate() {
    if (!form.name.trim()) {
      setFormError("Tarif adi gerekli");
      return;
    }
    const updated = recipes.map((r) =>
      r.id === editId ? formToRecipe(form, r.id) : r
    );
    saveState({ recipes: updated });
    setModal(null);
  }

  function handleDelete() {
    saveState({ recipes: recipes.filter((r) => r.id !== deleteId) });
    setModal(null);
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tarif Havuzu</h1>
          <p className="mt-0.5 text-xs text-slate-400">{recipes.length} tarif</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Yeni Tarif
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tarif ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
        />
      </div>

      {/* Type filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === value
                ? "gradient-bg text-white shadow-sm"
                : "border border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 hover:border-blue-100 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-bold text-slate-900 text-sm leading-snug">{r.name}</p>
              </div>
              {r.desc && <p className="text-xs text-slate-500 line-clamp-1">{r.desc}</p>}
              {r.servings && <p className="mt-0.5 text-xs text-slate-400">Olcek: {r.servings}</p>}
              {Array.isArray(r.ingredients) && r.ingredients.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">🛒 {r.ingredients.join(", ")}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${tagColor(r.cat)}`}>
                  {tagLabel(r.cat)}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                  {TYPE_LABELS[r.type]}
                </span>
                {r.we && (
                  <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] text-orange-500">
                    H.Sonu
                  </span>
                )}
                {r.kid && (
                  <span className="rounded-md bg-pink-50 px-2 py-0.5 text-[10px] text-pink-500">
                    Cocuk
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => openEdit(r)}
                className="rounded-xl border border-slate-100 p-2 text-slate-300 hover:border-blue-200 hover:text-blue-500 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => openDelete(r.id)}
                className="rounded-xl border border-slate-100 p-2 text-slate-300 hover:border-red-200 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Bu kategoride tarif yok
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modal === "add" || modal === "edit"}
        title={modal === "add" ? "Yeni Tarif Ekle" : "Tarif Duzenle"}
        onClose={() => setModal(null)}
      >
        <RecipeForm
          form={form}
          setField={setField}
          error={formError}
          onSave={modal === "add" ? handleSave : handleUpdate}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal open={modal === "delete"} title="Tarifi Sil" onClose={() => setModal(null)}>
        <p className="mb-5 text-sm text-slate-500">
          Bu tarifi silmek istediginize emin misiniz? Bu islem geri alinamaz.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setModal(null)}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Vazgec
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors"
          >
            Sil
          </button>
        </div>
      </Modal>
    </div>
  );
}

function RecipeForm({
  form,
  setField,
  error,
  onSave,
  onCancel,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Tarif adi *">
        <input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Ornek: Firinda tavuk"
          className={inputCls}
        />
      </Field>
      <Field label="Aciklama">
        <textarea
          value={form.desc}
          onChange={(e) => setField("desc", e.target.value)}
          placeholder="Kisa aciklama"
          rows={2}
          className={inputCls + " resize-none"}
        />
      </Field>
      <Field label="Olcek / Porsiyon">
        <input
          value={form.servings}
          onChange={(e) => setField("servings", e.target.value)}
          placeholder="Ornek: 2 yetiskin + 1 cocuk"
          className={inputCls}
        />
      </Field>
      <Field label="Malzemeler (her satira bir malzeme)">
        <textarea
          value={form.ingredients}
          onChange={(e) => setField("ingredients", e.target.value)}
          placeholder={"500g tavuk\n2 adet patates\n1 tatli kasigi kekik"}
          rows={4}
          className={inputCls + " resize-none"}
        />
      </Field>
      <Field label="Yapilis">
        <textarea
          value={form.instructions}
          onChange={(e) => setField("instructions", e.target.value)}
          placeholder="Kisa pisirme adimlari"
          rows={3}
          className={inputCls + " resize-none"}
        />
      </Field>
      <Field label="Not">
        <input value={form.notes} onChange={(e) => setField("notes", e.target.value)} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ogun turu">
          <select value={form.type} onChange={(e) => setField("type", e.target.value as MealType)} className={inputCls}>
            <option value="breakfast">Kahvalti</option>
            <option value="dinner">Aksam Yemegi</option>
            <option value="kid-breakfast">Cocuk Sabah</option>
            <option value="kid-lunch">Cocuk Ogle</option>
            <option value="kid-dinner">Cocuk Aksam</option>
          </select>
        </Field>
        <Field label="Kategori">
          <select value={form.cat} onChange={(e) => setField("cat", e.target.value as MealCat)} className={inputCls}>
            <option value="protein">Protein</option>
            <option value="light">Hafif</option>
            <option value="balanced">Dengeli</option>
          </select>
        </Field>
      </div>
      <Field label="Hafta sonu tarifi">
        <div className="flex gap-2">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setField("we", v)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                form.we === v
                  ? "border-blue-300 bg-blue-50 text-blue-600"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {v ? "Evet" : "Hayir"}
            </button>
          ))}
        </div>
      </Field>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          Iptal
        </button>
        <button onClick={onSave} className="flex-1 rounded-lg gradient-bg py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all">
          Kaydet
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
