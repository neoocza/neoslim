"use client";

import { useQuery, useMutation } from "convex/react";
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
  Droplets,
  GlassWater,
  Minus,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

function todayString() {
  // Use local date, not UTC
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

const MACRO_COLORS = {
  protein: "#3b82f6",
  carbs: "#f59e0b",
  fats: "#ef4444",
};

export default function Dashboard() {
  const profile = useQuery(api.profiles.get);
  const today = todayString();
  const dailyLog = useQuery(api.dailyLogs.getByDate, { date: today });
  const foodEntries = useQuery(api.foodEntries.listByDate, { date: today });
  const weightEntries = useQuery(api.weightEntries.list, { limit: 30 });
  const recentLogs = useQuery(api.dailyLogs.list, { limit: 7 });
  const addWater = useMutation(api.dailyLogs.addWater);
  const removeWater = useMutation(api.dailyLogs.removeWater);

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
  const kcalBudget = profile.dailyCalorieMax;
  const steps = dailyLog?.stepsCount ?? 0;
  const stepTarget = profile.dailyStepTarget;
  const stepPercent = Math.min(100, (steps / stepTarget) * 100);
  const deficit = dailyLog?.deficitKcal ?? 0;
  const latestWeight = weightEntries?.[0]?.weightKg ?? profile.startWeightKg;
  const waterGlasses = dailyLog?.waterGlasses ?? 0;
  const waterTarget = profile.dailyWaterGlassTarget ?? 8;

  // Macro totals
  const totalProtein = foodEntries?.reduce((s, e) => s + (e.proteinG ?? 0), 0) ?? 0;
  const totalCarbs = foodEntries?.reduce((s, e) => s + (e.carbsG ?? 0), 0) ?? 0;
  const totalFats = foodEntries?.reduce((s, e) => s + (e.fatsG ?? 0), 0) ?? 0;
  const totalMacroG = totalProtein + totalCarbs + totalFats;

  const macroData = [
    { name: "Protein", value: totalProtein, color: MACRO_COLORS.protein },
    { name: "Carbs", value: totalCarbs, color: MACRO_COLORS.carbs },
    { name: "Fats", value: totalFats, color: MACRO_COLORS.fats },
  ];

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

      {/* Calorie Budget Ring */}
      <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
        <div className="flex items-center gap-6">
          <CalorieRing consumed={kcalConsumed} budget={kcalBudget} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider font-medium">
                Budget ceiling
              </div>
              <div className="text-sm font-semibold">
                {kcalBudget} kcal max
              </div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wider font-medium">
                Consumed
              </div>
              <div className="text-sm font-semibold">
                {kcalConsumed} kcal
              </div>
            </div>
            {deficit > 0 && (
              <div>
                <div className="text-xs text-muted uppercase tracking-wider font-medium">
                  Deficit
                </div>
                <div className="text-sm font-semibold text-success">
                  {deficit} kcal
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="rounded-2xl bg-card-bg border border-card-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-sky-500" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted">
              Water
            </span>
          </div>
          <span className="text-sm font-semibold">
            {waterGlasses} / {waterTarget}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: waterTarget }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-6 rounded-md transition-colors ${
                i < waterGlasses ? "bg-sky-400" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => removeWater({ date: today })}
            disabled={waterGlasses === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-card-border text-xs font-medium text-muted hover:border-danger/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => addWater({ date: today, profileId: profile._id })}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 active:scale-95 transition-transform"
          >
            <GlassWater size={14} />
            Add glass
          </button>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="rounded-2xl bg-card-bg border border-card-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Footprints size={16} className="text-accent" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted">
              Steps
            </span>
          </div>
          <span className="text-sm font-semibold">
            {steps.toLocaleString()} / {stepTarget.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${stepPercent}%`,
              backgroundColor: stepPercent >= 100 ? "#10b981" : "#0d9488",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-muted">
          <span>{Math.round(stepPercent)}% of target</span>
          <span>{Math.max(0, stepTarget - steps).toLocaleString()} to go</span>
        </div>
      </div>

      {/* Macro Breakdown */}
      {totalMacroG > 0 && (
        <div className="rounded-2xl bg-card-bg border border-card-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Macros
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData.filter((d) => d.value > 0)}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={42}
                    strokeWidth={0}
                  >
                    {macroData
                      .filter((d) => d.value > 0)
                      .map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {macroData.map((macro) => (
                <div key={macro.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="text-xs text-muted flex-1">{macro.name}</span>
                  <span className="text-sm font-semibold">{macro.value}g</span>
                  <span className="text-[10px] text-muted w-8 text-right">
                    {totalMacroG > 0
                      ? Math.round((macro.value / totalMacroG) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
              <div className="pt-1 border-t border-card-border flex items-center justify-between">
                <span className="text-xs text-muted">
                  Protein target: {profile.dailyProteinTargetG}g
                </span>
                <span
                  className={`text-xs font-semibold ${
                    totalProtein >= profile.dailyProteinTargetG
                      ? "text-success"
                      : "text-muted"
                  }`}
                >
                  {totalProtein >= profile.dailyProteinTargetG
                    ? "Hit!"
                    : `${profile.dailyProteinTargetG - totalProtein}g to go`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Weight"
          value={`${latestWeight} kg`}
          sub={`Goal: ${profile.goalWeightKg} kg`}
          icon={<Scale size={16} />}
        />
        <StatCard
          label="Deficit"
          value={`${deficit} kcal`}
          sub="estimated today"
          icon={<TrendingDown size={16} />}
          accent
        />
        <StatCard
          label="Burned"
          value={`${dailyLog?.kcalBurned ?? "—"}`}
          sub="TDEE estimate"
          icon={<Flame size={16} />}
        />
        <StatCard
          label="Water"
          value={`${waterGlasses} / ${waterTarget}`}
          sub="glasses today"
          icon={<Droplets size={16} />}
          accent
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
                  {/* Photo thumbnail or category icon */}
                  {entry.photoUrl ? (
                    <img
                      src={entry.photoUrl}
                      alt={entry.item}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}
                    >
                      <Icon size={16} />
                    </div>
                  )}
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
                    {(entry.proteinG || entry.carbsG || entry.fatsG) && (
                      <div className="flex gap-2 mt-0.5 text-[10px]">
                        {entry.proteinG != null && (
                          <span style={{ color: MACRO_COLORS.protein }}>
                            P {entry.proteinG}g
                          </span>
                        )}
                        {entry.carbsG != null && (
                          <span style={{ color: MACRO_COLORS.carbs }}>
                            C {entry.carbsG}g
                          </span>
                        )}
                        {entry.fatsG != null && (
                          <span style={{ color: MACRO_COLORS.fats }}>
                            F {entry.fatsG}g
                          </span>
                        )}
                      </div>
                    )}
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
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
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
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#d1d5db" />
              <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" width={35} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={kcalBudget}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "Max", fontSize: 10, fill: "#ef4444" }}
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
