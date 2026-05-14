"use client";

import { Plus, Clock, Flame } from "lucide-react";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  prepMins: number;
  tag: string;
  emoji: string;
};

type Props = {
  meal?: Meal;
  onAdd?: () => void;
};

export default function MealCard({ meal, onAdd }: Props) {
  if (!meal) {
    return (
      <button
        onClick={onAdd}
        className="group flex h-full min-h-[88px] w-full items-center justify-center rounded-lg border border-dashed border-[#2a2a3a] bg-transparent text-[#3f3f52] transition-all hover:border-[#a3e635]/40 hover:bg-[#a3e635]/5 hover:text-[#a3e635]"
      >
        <Plus size={18} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div className="group relative flex min-h-[88px] flex-col justify-between rounded-lg border border-[#1e1e2a] bg-[#111118] p-3 transition-all hover:border-[#a3e635]/30 hover:bg-[#13131c]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xl">{meal.emoji}</span>
        <span className="rounded-full bg-[#a3e635]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a3e635]">
          {meal.tag}
        </span>
      </div>
      <p className="mb-2 text-sm font-semibold leading-tight text-white">
        {meal.name}
      </p>
      <div className="flex items-center gap-3 text-[11px] text-[#9090a8]">
        <span className="flex items-center gap-1">
          <Flame size={11} className="text-orange-400" />
          {meal.calories} kcal
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {meal.prepMins}m
        </span>
      </div>
    </div>
  );
}
