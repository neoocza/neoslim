import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    name: v.string(),
    age: v.number(),
    sex: v.string(),
    heightCm: v.number(),
    startWeightKg: v.number(),
    goalWeightKg: v.number(),
    tdeeKcal: v.number(),
    bmrKcal: v.number(),
    dailyCalorieMin: v.number(),
    dailyCalorieMax: v.number(),
    dailyProteinTargetG: v.number(),
    dailyStepTarget: v.number(),
    dailyWaterGlassTarget: v.optional(v.number()),
    ifWindow: v.optional(v.string()),
    cheatMealsPerWeek: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),

  weightEntries: defineTable({
    date: v.string(),
    weightKg: v.number(),
    profileId: v.id("profiles"),
  }).index("by_date", ["date"]),

  dailyLogs: defineTable({
    date: v.string(),
    profileId: v.id("profiles"),
    stepsCount: v.optional(v.number()),
    kcalTotal: v.optional(v.number()),
    kcalBurned: v.optional(v.number()),
    deficitKcal: v.optional(v.number()),
    waterGlasses: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_date", ["date"]),

  foodEntries: defineTable({
    dailyLogId: v.id("dailyLogs"),
    timeLocal: v.string(),
    item: v.string(),
    details: v.optional(v.string()),
    kcalEstimate: v.number(),
    kcalRangeLow: v.optional(v.number()),
    kcalRangeHigh: v.optional(v.number()),
    proteinG: v.optional(v.number()),
    carbsG: v.optional(v.number()),
    fatsG: v.optional(v.number()),
    photoStorageId: v.optional(v.id("_storage")),
    category: v.union(
      v.literal("meal"),
      v.literal("drink"),
      v.literal("snack")
    ),
  }).index("by_dailyLog", ["dailyLogId"]),
});
