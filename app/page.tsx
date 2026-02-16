"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import CalorieRing from "./components/CalorieRing";
import StatCard from "./components/StatCard";
import {
  Flame,
  Footprints,
  TrendingDown,
  Scale,
  Coffee,
  UtensilsCrossed,
  Cookie,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Tooltip,
  CartesianGrid,
} from "recharts";

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const categoryIcon = {
  meal: UtensilsCrossed,
  drink: Coffee,
  snack: Cookie,
};

const categoryColor = {
  meal: "bg-amber-50 text-amber-600",
  drink: "bg-sky-50 text-sky-600",
  snack: "bg-rose-50 text-rose-600",
};

export default function Dashboard() {
  const profile = useQuery(api.profiles.get);
  const today = todayString();
  const dailyLog = useQuery(api.dailyLogs.getByDate, { date: today });
  const foodEntries = useQuery(api.foodEntries.listByDate, { date: today });
  const weightEntries = useQuery(api.weightEntries.list, { limit: 30 });
  const recentLogs = useQuery(api.dailyLogs.list, { limit: 7 });

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Welcome to NeoSlim</h1>
        <p className="text-muted text-sm">
          No profile found. Run the seed function to import your data.
        </p>
        <p className="text-xs text-muted mt-2 font-mono">
          npx convex run seed:seedData
        </p>
      </div>
    );
  }

  const kcalConsumed = dailyLog?.kcalTotal ?? 0;
  const kcalTarget = Math.round(
    (profile.dailyCalorieMin + profile.dailyCalorieMax) / 2
  );
  const steps = dailyLog?.stepsCount ?? 0;
  const deficit = dailyLog?.deficitKcal ?? 0;
  const latestWeight = weightEntries?.[0]?.weightKg ?? profile.startWeightKg;

  // Weight chart data (chronological)
  const weightChartData = (weightEntries ?? [])
    .slice()
    .reverse()
    .map((w) => ({
      date: w.date.slice(5),
      weight: w.weightKg,
    }));

  // Weekly bar data (chronological)
  const weeklyData = (recentLogs ?? [])
    .slice()
    .reverse()
    .map((l) => ({
      day: new Date(l.date + "T12:00:00").toLocaleDateString("en", {
        weekday: "short",
      }),
      kcal: l.kcalTotal ?? 0,
      target: kcalTarget,
    }));

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hey, {profile.name}
        </h1>
        <p className="text-sm text-muted mt-0.5">
          {new Date().toLocaleDateString("en-ZA", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Calorie Ring + Stats */}
      <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
        <div className="flex items-center gap-6">
          <CalorieRing consumed={kcalConsumed} target={kcalTarget} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider font-medium">
                Remaining
              </div>
              <div className="text-xl font-bold text-accent">
                {Math.max(0, kcalTarget - kcalConsumed)} kcal
              </div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wider font-medium">
                Target range
              </div>
              <div className="text-sm font-semibold">
                {profile.dailyCalorieMin}&ndash;{profile.dailyCalorieMax} kcal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Steps"
          value={steps.toLocaleString()}
          sub={`/ ${profile.dailyStepTarget.toLocaleString()} target`}
          icon={<Footprints size={16} />}
          accent
        />
        <StatCard
          label="Deficit"
          value={`${deficit} kcal`}
          sub="estimated today"
          icon={<TrendingDown size={16} />}
          accent
        />
        <StatCard
          label="Weight"
          value={`${latestWeight} kg`}
          sub={`Goal: ${profile.goalWeightKg} kg`}
          icon={<Scale size={16} />}
        />
        <StatCard
          label="Burned"
          value={`${dailyLog?.kcalBurned ?? "—"}`}
          sub="TDEE estimate"
          icon={<Flame size={16} />}
        />
      </div>

      {/* Today's Food Timeline */}
      <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
          Today&apos;s Meals
        </h2>
        {foodEntries && foodEntries.length > 0 ? (
          <div className="space-y-3">
            {foodEntries.map((entry) => {
              const Icon =
                categoryIcon[entry.category as keyof typeof categoryIcon] ??
                UtensilsCrossed;
              const colorCls =
                categoryColor[entry.category as keyof typeof categoryColor] ??
                "bg-gray-50 text-gray-600";
              return (
                <div key={entry._id} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {entry.item}
                      </span>
                      <span className="text-sm font-semibold text-accent whitespace-nowrap">
                        {entry.kcalEstimate}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      {entry.timeLocal}
                      {entry.details && ` — ${entry.details}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">No entries yet today.</p>
        )}
      </div>

      {/* Weight Trend */}
      {weightChartData.length > 1 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Weight Trend
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="#d1d5db"
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
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
              <ReferenceLine
                y={profile.goalWeightKg}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: "Goal", fontSize: 10, fill: "#10b981" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0d9488" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Calories Bar Chart */}
      {weeklyData.length > 1 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            This Week
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="#d1d5db"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" width={35} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={kcalTarget}
                stroke="#f59e0b"
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="kcal"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
