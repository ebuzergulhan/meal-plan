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

  // Validate: all must be positive finite numbers
  const nums = [ballWeight, ballCount, hydration, saltPct, oilPct, poolishFlour];
  if (nums.some((n) => !isFinite(n) || n <= 0)) return null;

  // Core baker's % calculations
  const totalDough  = ballWeight * ballCount;
  // Flour = base; water, salt, oil are ON TOP of flour
  const totalFlour  = totalDough / (1 + hydration);
  const totalWater  = totalFlour * hydration;
  const totalSalt   = totalFlour * saltPct;
  const totalOil    = totalFlour * oilPct;

  // Poolish is 1:1 flour:water
  const poolishWater = poolishFlour;
  const poolishTotal = poolishFlour + poolishWater;

  // Poolish flour cannot exceed total flour
  if (poolishFlour >= totalFlour) return { error: "poolish" as const };

  // Main dough additions
  const addFlour   = totalFlour - poolishFlour;
  const addWater   = totalWater - poolishWater;
  const addSalt    = totalSalt;
  const addOil     = totalOil;
  const addPoolish = poolishTotal;

  // Final mixed weight is slightly higher than target because
  // salt & oil are added on top of the flour+water base
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
      <label className="text-[11px] font-bold uppercase tracking-widest text-[#9090a8]">
        {label}{" "}
        <span className="text-[#a3e635]">({unit})</span>
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#a3e635]/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        highlight
          ? "border border-[#a3e635]/20 bg-[#a3e635]/5"
          : "border border-[#1e1e2a] bg-[#0a0a0f]"
      }`}
    >
      <span className={`text-sm ${highlight ? "font-bold text-[#a3e635]" : "text-[#9090a8]"}`}>
        {label}
      </span>
      <span className={`text-sm font-bold tabular-nums ${highlight ? "text-[#a3e635]" : "text-white"}`}>
        {value} <span className="font-normal text-[#3f3f52]">{unit}</span>
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
    <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-extrabold text-white">{title}</h2>
        {badge && (
          <span className="rounded-full bg-[#a3e635]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#a3e635]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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

    // Use native Web Share API if available (mobile: WhatsApp, Mail, Notes…)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Pizza Hamuru Tarifi", text });
      } catch {
        // user cancelled — do nothing
      }
      return;
    }

    // Fallback: copy to clipboard
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
          <h1 className="text-xl font-extrabold text-white">
            Pizza Hamuru Hesaplayıcı
          </h1>
          <p className="mt-0.5 text-xs text-[#9090a8]">
            Baker&apos;s yüzdesi — un = 100%, diğerleri una orantılı
          </p>
        </div>

        {!hasError && result && result.error === null && (
          <button
            onClick={handleShare}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
              copied
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-[#a3e635] text-black hover:bg-[#bef264]"
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
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3 sm:grid-cols-4">
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
                  <span className="text-[10px] uppercase tracking-widest text-[#3f3f52]">{label}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Validation error ── */}
        {result === null && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Tüm değerler sıfırdan büyük pozitif sayı olmalıdır.
          </div>
        )}
        {result !== null && result.error === "poolish" && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Poolish unu toplam undan ({result && "totalFlour" in result ? "" : ""}
            {(() => {
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
              <p className="mt-3 text-[11px] text-[#3f3f52]">
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

              {/* Divider */}
              <div className="my-3 border-t border-[#1e1e2a]" />

              {/* Weight note */}
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
              <p className="mt-3 text-[11px] text-[#3f3f52]">
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
