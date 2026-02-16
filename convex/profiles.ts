import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    return profiles[0] ?? null;
  },
});

export const upsert = mutation({
  args: {
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
    ifWindow: v.optional(v.string()),
    cheatMealsPerWeek: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("profiles").collect();
    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, args);
      return existing[0]._id;
    }
    return await ctx.db.insert("profiles", args);
  },
});
