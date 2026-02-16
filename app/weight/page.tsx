"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Scale, TrendingDown, Target, CalendarDays } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  CartesianGrid,
} from "recharts";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogWeight() {
  const profile = useQuery(api.profiles.get);
  const weightEntries = useQuery(api.weightEntries.list, {});
  const addWeight = useMutation(api.weightEntries.add);

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayString());
  const [submitting, setSubmitting] = useState(false);

  const entries = weightEntries ?? [];
  const latestWeight = entries[0]?.weightKg ?? profile?.startWeightKg ?? 0;
  const totalLost = profile ? profile.startWeightKg - latestWeight : 0;
  const toGo = profile ? latestWeight - profile.goalWeightKg : 0;

  // Rate of loss (kg per week based on available data)
  const ratePerWeek =
    entries.length >= 2
      ? (() => {
          const newest = entries[0];
          const oldest = entries[entries.length - 1];
          const days =
            (new Date(newest.date).getTime() -
              new Date(oldest.date).getTime()) /
            (1000 * 60 * 60 * 24);
          if (days < 1) return 0;
          return ((oldest.weightKg - newest.weightKg) / days) * 7;
        })()
      : 0;

  const daysToGoal =
    ratePerWeek > 0 ? Math.ceil((toGo / ratePerWeek) * 7) : null;

  // Chart data (chronological)
  const chartData = entries
    .slice()
    .reverse()
    .map((w) => ({
      date: w.date.slice(5),
      weight: w.weightKg,
    }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || !profile) return;
    setSubmitting(true);
    try {
      await addWeight({
        date,
        weightKg: parseFloat(weight),
        profileId: profile._id,
      });
      setWeight("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Weight Log</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card-bg border border-card-border p-3 shadow-sm text-center">
          <Scale size={16} className="mx-auto text-accent mb-1" />
          <div className="text-lg font-bold">{latestWeight}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Current kg
          </div>
        </div>
        <div className="rounded-2xl bg-card-bg border border-card-border p-3 shadow-sm text-center">
          <TrendingDown size={16} className="mx-auto text-success mb-1" />
          <div className="text-lg font-bold">{totalLost.toFixed(1)}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Lost kg
          </div>
        </div>
        <div className="rounded-2xl bg-card-bg border border-card-border p-3 shadow-sm text-center">
          <Target size={16} className="mx-auto text-warning mb-1" />
          <div className="text-lg font-bold">{toGo.toFixed(1)}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider">
            To go kg
          </div>
        </div>
      </div>

      {/* Rate & days to goal */}
      {ratePerWeek > 0 && (
        <div className="rounded-2xl bg-accent-bg border border-card-border p-4 shadow-sm flex items-center gap-3">
          <CalendarDays size={18} className="text-accent flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">
              {ratePerWeek.toFixed(1)} kg/week
            </span>
            {daysToGoal && (
              <span className="text-muted">
                {" "}
                &middot; ~{daysToGoal} days to goal
              </span>
            )}
          </div>
        </div>
      )}

      {/* Weight input */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Log Weight
        </h2>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.1"
            placeholder="Weight in kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !weight}
          className="w-full py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Weight"}
        </button>
      </form>

      {/* Weight chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="#d1d5db"
              />
              <YAxis
                domain={[
                  (profile?.goalWeightKg ?? 70) - 2,
                  (profile?.startWeightKg ?? 95) + 2,
                ]}
                tick={{ fontSize: 11 }}
                stroke="#d1d5db"
                width={35}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              {profile && (
                <ReferenceLine
                  y={profile.goalWeightKg}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: "Goal", fontSize: 10, fill: "#10b981" }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0d9488" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight history list */}
      {entries.length > 0 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            History
          </h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between py-1.5 border-b border-card-border last:border-0"
              >
                <span className="text-sm text-muted">{e.date}</span>
                <span className="text-sm font-semibold">{e.weightKg} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
