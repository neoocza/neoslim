import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    return profiles[0] ?? null;
  },
});

export const patch = mutation({
  args: {
    dailyCalorieMax: v.optional(v.number()),
    dailyCalorieMin: v.optional(v.number()),
    dailyStepTarget: v.optional(v.number()),
    dailyWaterGlassTarget: v.optional(v.number()),
    dailyProteinTargetG: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("profiles").collect();
    if (existing.length === 0) throw new Error("No profile found");
    const fields = Object.fromEntries(
      Object.entries(args).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(existing[0]._id, fields);
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
