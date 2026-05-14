"use client";

import { useState, useMemo, useCallback } from "react";
import { Share2, Copy, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Inputs = {
  ballWeight: string;
  ballCount: string;
  hydration: string;  // percent, e.g. "68"
  saltPct: string;    // percent, e.g. "2"
  oilPct: string;     // percent, e.g. "1"
  poolishFlour: string;
};

// ─── Calculation ──────────────────────────────────────────────────────────────

function calculate(inputs: Inputs) {
  const ballWeight   = parseFloat(inputs.ballWeight);
  const ballCount    = parseFloat(inputs.ballCount);
  const hydration    = parseFloat(inputs.hydration) / 100;
  const saltPct      = parseFloat(inputs.saltPct)   / 100;
  const oilPct       = parseFloat(inputs.oilPct)    / 100;
  const poolishFlour = parseFloat(inputs.poolishFlour);

  const nums = [ballWeight, ballCount, hydration, saltPct, oilPct, poolishFlour];
  if (nums.some((n) => !isFinite(n) || n <= 0)) return null;

  const totalDough  = ballWeight * ballCount;
  const totalFlour  = totalDough / (1 + hydration);
  const totalWater  = totalFlour * hydration;
  const totalSalt   = totalFlour * saltPct;
  const totalOil    = totalFlour * oilPct;

  const poolishWater = poolishFlour;
  const poolishTotal = poolishFlour + poolishWater;

  if (poolishFlour >= totalFlour) return { error: "poolish" as const };

  const addFlour   = totalFlour - poolishFlour;
  const addWater   = totalWater - poolishWater;
  const addSalt    = totalSalt;
  const addOil     = totalOil;
  const addPoolish = poolishTotal;

  const finalWeight = totalDough + totalSalt + totalOil;

  return {
    error: null,
    totalDough,
    totalFlour,
    totalWater,
    totalSalt,
    totalOil,
    poolishFlour,
    poolishWater,
    poolishTotal,
    addFlour,
    addWater,
    addSalt,
    addOil,
    addPoolish,
    finalWeight,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toFixed(1);

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  unit,
  value,
  onChange,
  min = "0.1",
  step = "1",
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label} <span className="gradient-text">({unit})</span>
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  unit = "gr",
  highlight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
        highlight
          ? "border"
          : "border border-slate-100 bg-slate-50"
      }`}
      style={highlight ? { background: "rgba(37,99,235,0.05)", borderColor: "rgba(37,99,235,0.15)" } : {}}
    >
      <span className={`text-sm ${highlight ? "font-bold gradient-text" : "text-slate-600"}`}>
        {label}
      </span>
      <span className={`text-sm font-bold tabular-nums ${highlight ? "gradient-text" : "text-slate-900"}`}>
        {value} <span className={`font-normal ${highlight ? "" : "text-slate-400"}`}>{unit}</span>
      </span>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
        {badge && (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-500">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Share text builder ───────────────────────────────────────────────────────

function buildShareText(inputs: Inputs, r: ReturnType<typeof calculate> & { error: null }): string {
  return `🍕 Pizza Hamuru Tarifi

📋 Girdiler
• ${inputs.ballCount} adet × ${inputs.ballWeight} gr = ${fmt(r.totalDough)} gr toplam hamur
• Hidrasyon: ${parseFloat(inputs.hydration).toFixed(1)}%
• Tuz oranı: ${parseFloat(inputs.saltPct).toFixed(1)}%
• Zeytinyağı oranı: ${parseFloat(inputs.oilPct).toFixed(1)}%

🌾 Poolish (1 gün önce hazırla)
• Poolish unu: ${fmt(r.poolishFlour)} gr
• Poolish suyu: ${fmt(r.poolishWater)} gr
• Poolish toplam: ${fmt(r.poolishTotal)} gr

🥣 Ana hamura eklenecek
• Eklenecek un: ${fmt(r.addFlour)} gr
• Eklenecek su: ${fmt(r.addWater)} gr
• Tuz: ${fmt(r.addSalt)} gr
• Zeytinyağı: ${fmt(r.addOil)} gr
• Poolish: ${fmt(r.addPoolish)} gr

⚖️ Hedef hamur: ${fmt(r.totalDough)} gr
⚖️ Gerçek karışım: ${fmt(r.finalWeight)} gr`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

const DEFAULTS: Inputs = {
  ballWeight:   "275",
  ballCount:    "6",
  hydration:    "68",
  saltPct:      "2",
  oilPct:       "1",
  poolishFlour: "200",
};

export default function PizzaPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Inputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const handleShare = useCallback(async () => {
    if (result === null || result.error !== null) return;
    const text = buildShareText(inputs, result as typeof result & { error: null });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Pizza Hamuru Tarifi", text });
      } catch {
        // user cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }, [inputs, result]);

  const hasError =
    result === null ||
    (result as { error: "poolish" }).error === "poolish";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Pizza Hamuru Hesaplayıcı
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Baker&apos;s yüzdesi — un = 100%, diğerleri una orantılı
          </p>
        </div>

        {!hasError && result && result.error === null && (
          <button
            onClick={handleShare}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
              copied
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "gradient-bg text-white shadow-md shadow-blue-100 hover:opacity-90"
            }`}
          >
            {copied ? (
              <>
                <Check size={13} strokeWidth={3} />
                Kopyalandı
              </>
            ) : (
              <>
                <Share2 size={13} strokeWidth={2.5} />
                Paylaş
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* ── Inputs ── */}
        <Section title="Girdiler">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InputField label="Hamur ağırlığı" unit="gr"  value={inputs.ballWeight}   onChange={set("ballWeight")}   step="5" />
            <InputField label="Pizza adedi"     unit="adet" value={inputs.ballCount}    onChange={set("ballCount")}    step="1" min="1" />
            <InputField label="Hidrasyon"        unit="%"   value={inputs.hydration}    onChange={set("hydration")}   step="0.5" />
            <InputField label="Tuz oranı"        unit="%"   value={inputs.saltPct}      onChange={set("saltPct")}      step="0.1" />
            <InputField label="Zeytinyağı oranı" unit="%"   value={inputs.oilPct}       onChange={set("oilPct")}       step="0.1" />
            <InputField label="Poolish unu"      unit="gr"  value={inputs.poolishFlour} onChange={set("poolishFlour")} step="10" />
          </div>

          {/* Summary row */}
          {result && result.error === null && (
            <div
              className="mt-4 grid grid-cols-2 gap-2 rounded-xl p-3 sm:grid-cols-4"
              style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.1)" }}
            >
              {[
                { label: "Toplam hamur", value: fmt(result.totalDough) + " gr" },
                { label: "Toplam un",    value: fmt(result.totalFlour) + " gr" },
                { label: "Toplam su",    value: fmt(result.totalWater) + " gr" },
                {
                  label: "Hidrasyon",
                  value: parseFloat(inputs.hydration).toFixed(1) + "%",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">{label}</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Validation error ── */}
        {result === null && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Tüm değerler sıfırdan büyük pozitif sayı olmalıdır.
          </div>
        )}
        {result !== null && result.error === "poolish" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Poolish unu toplam undan ({(() => {
              const r = calculate({ ...inputs, poolishFlour: "0" });
              return r && r.error === null ? fmt(r.totalFlour) : "—";
            })()}{" "}
            gr) fazla olamaz.
          </div>
        )}

        {/* ── Poolish ── */}
        {!hasError && result && result.error === null && (
          <>
            <Section title="Poolish (1:1)" badge="1 gün önce">
              <div className="space-y-2">
                <ResultRow label="Poolish unu"    value={fmt(result.poolishFlour)} />
                <ResultRow label="Poolish suyu"   value={fmt(result.poolishWater)} />
                <ResultRow label="Poolish toplam" value={fmt(result.poolishTotal)} highlight />
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Eşit un ve su karıştırın, 1 saat oda sıcaklığında bekletin, ardından 12–16 saat buzdolabına kaldırın.
              </p>
            </Section>

            {/* ── Main dough ── */}
            <Section title="Ana hamurda eklenecek">
              <div className="space-y-2">
                <ResultRow label="Eklenecek un"    value={fmt(result.addFlour)} />
                <ResultRow label="Eklenecek su"    value={fmt(result.addWater)} />
                <ResultRow label="Tuz"             value={fmt(result.addSalt)} />
                <ResultRow label="Zeytinyağı"      value={fmt(result.addOil)} />
                <ResultRow label="Poolish"         value={fmt(result.addPoolish)} />
              </div>

              <div className="my-3 border-t border-slate-100" />

              <div className="space-y-2">
                <ResultRow
                  label="Hedef hamur ağırlığı"
                  value={fmt(result.totalDough)}
                />
                <ResultRow
                  label="Gerçek karışım ağırlığı"
                  value={fmt(result.finalWeight)}
                  highlight
                />
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Tuz ve zeytinyağı una oranla eklenir; bu nedenle gerçek karışım ağırlığı hedef
                ağırlıktan tuz ({fmt(result.addSalt)} gr) + zeytinyağı ({fmt(result.addOil)} gr)
                kadar fazladır. Bu baker&apos;s yüzdesi davranışı olarak doğrudur.
              </p>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
