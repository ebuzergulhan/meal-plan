type Props = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories?: number;
};

export default function NutritionBar({
  calories,
  protein,
  carbs,
  fat,
  targetCalories = 2200,
}: Props) {
  const pct = Math.min((calories / targetCalories) * 100, 100);
  const total = protein + carbs + fat || 1;

  return (
    <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#9090a8]">
            Today&apos;s Calories
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">
            {calories.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-[#9090a8]">
              / {targetCalories.toLocaleString()} kcal
            </span>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            pct >= 90
              ? "bg-[#a3e635]/20 text-[#a3e635]"
              : "bg-[#1e1e2a] text-[#9090a8]"
          }`}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Calorie progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#1e1e2a]">
        <div
          className="h-full rounded-full bg-[#a3e635] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Macro split */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Protein", value: protein, color: "bg-blue-500", pct: Math.round((protein / total) * 100) },
          { label: "Carbs", value: carbs, color: "bg-amber-400", pct: Math.round((carbs / total) * 100) },
          { label: "Fat", value: fat, color: "bg-rose-500", pct: Math.round((fat / total) * 100) },
        ].map(({ label, value, color, pct: mp }) => (
          <div key={label} className="rounded-lg bg-[#0a0a0f] p-3">
            <div className={`mb-2 h-1 rounded-full ${color}`} style={{ width: `${mp}%`, minWidth: "8px" }} />
            <p className="text-sm font-bold text-white">{value}g</p>
            <p className="text-[11px] text-[#9090a8]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
