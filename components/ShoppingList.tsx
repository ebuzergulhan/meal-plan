"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

const defaultItems = [
  { id: "1", name: "Chicken breast", qty: "600g", section: "Meat" },
  { id: "2", name: "Salmon fillet", qty: "400g", section: "Seafood" },
  { id: "3", name: "Brown rice", qty: "1 kg", section: "Grains" },
  { id: "4", name: "Quinoa", qty: "500g", section: "Grains" },
  { id: "5", name: "Broccoli", qty: "2 heads", section: "Veg" },
  { id: "6", name: "Spinach", qty: "200g bag", section: "Veg" },
  { id: "7", name: "Sweet potato", qty: "4 pcs", section: "Veg" },
  { id: "8", name: "Greek yogurt", qty: "500g", section: "Dairy" },
  { id: "9", name: "Eggs", qty: "12 pack", section: "Dairy" },
  { id: "10", name: "Olive oil", qty: "500ml", section: "Pantry" },
];

const sections = [...new Set(defaultItems.map((i) => i.section))];

export default function ShoppingList() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const done = checked.size;
  const total = defaultItems.length;

  return (
    <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-[#a3e635]" />
          <h3 className="font-bold text-white">Shopping List</h3>
        </div>
        <span className="text-sm text-[#9090a8]">
          {done}/{total} items
        </span>
      </div>

      {/* Progress */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#1e1e2a]">
        <div
          className="h-full rounded-full bg-[#a3e635] transition-all duration-300"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#3f3f52]">
              {section}
            </p>
            <div className="space-y-1">
              {defaultItems
                .filter((i) => i.section === section)
                .map((item) => {
                  const done = checked.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        done
                          ? "bg-[#a3e635]/5 text-[#3f3f52]"
                          : "hover:bg-[#1a1a24]"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          done
                            ? "border-[#a3e635] bg-[#a3e635]"
                            : "border-[#2a2a3a]"
                        }`}
                      >
                        {done && <Check size={11} className="text-black" strokeWidth={3} />}
                      </div>
                      <span
                        className={`flex-1 text-sm font-medium transition-colors ${
                          done ? "line-through text-[#3f3f52]" : "text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-[#9090a8]">{item.qty}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
