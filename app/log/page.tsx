"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Coffee, UtensilsCrossed, Cookie, Trash2 } from "lucide-react";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function LogFood() {
  const today = todayString();
  const profile = useQuery(api.profiles.get);
  const dailyLog = useQuery(api.dailyLogs.getByDate, { date: today });
  const foodEntries = useQuery(api.foodEntries.listByDate, { date: today });

  const createDailyLog = useMutation(api.dailyLogs.create);
  const addFood = useMutation(api.foodEntries.add);
  const removeFood = useMutation(api.foodEntries.remove);

  const [item, setItem] = useState("");
  const [details, setDetails] = useState("");
  const [kcal, setKcal] = useState("");
  const [time, setTime] = useState(nowTimeString());
  const [category, setCategory] = useState<"meal" | "drink" | "snack">("meal");
  const [submitting, setSubmitting] = useState(false);

  const kcalTotal = foodEntries?.reduce((s, e) => s + e.kcalEstimate, 0) ?? 0;
  const kcalTarget = profile
    ? Math.round((profile.dailyCalorieMin + profile.dailyCalorieMax) / 2)
    : 2000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item || !kcal || !profile) return;
    setSubmitting(true);
    try {
      let logId = dailyLog?._id;
      if (!logId) {
        logId = await createDailyLog({ date: today, profileId: profile._id });
      }
      await addFood({
        dailyLogId: logId,
        timeLocal: time,
        item,
        details: details || undefined,
        kcalEstimate: parseInt(kcal),
        category,
      });
      setItem("");
      setDetails("");
      setKcal("");
      setTime(nowTimeString());
    } finally {
      setSubmitting(false);
    }
  }

  const categories = [
    { value: "meal" as const, label: "Meal", icon: UtensilsCrossed },
    { value: "drink" as const, label: "Drink", icon: Coffee },
    { value: "snack" as const, label: "Snack", icon: Cookie },
  ];

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Running total */}
      <div className="rounded-2xl bg-accent-bg border border-card-border p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider font-medium">
              Today&apos;s total
            </div>
            <div className="text-2xl font-bold text-accent">
              {kcalTotal} kcal
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">Remaining</div>
            <div className="text-lg font-semibold">
              {Math.max(0, kcalTarget - kcalTotal)}
            </div>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (kcalTotal / kcalTarget) * 100)}%`,
              backgroundColor:
                kcalTotal > kcalTarget ? "#ef4444" : "#0d9488",
            }}
          />
        </div>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Add Entry
        </h2>

        {/* Category pills */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === cat.value
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-muted border-card-border hover:border-accent/40"
              }`}
            >
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="What did you eat or drink?"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          required
        />

        <input
          type="text"
          placeholder="Details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="kcal"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            required
            min={0}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !item || !kcal}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          {submitting ? "Adding..." : "Add Entry"}
        </button>
      </form>

      {/* Today's entries */}
      {foodEntries && foodEntries.length > 0 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Today&apos;s Entries
          </h2>
          <div className="space-y-2">
            {foodEntries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between py-2 border-b border-card-border last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {entry.item}
                  </div>
                  <div className="text-xs text-muted">{entry.timeLocal}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-accent">
                    {entry.kcalEstimate}
                  </span>
                  <button
                    onClick={() => removeFood({ id: entry._id })}
                    className="text-muted hover:text-danger p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
