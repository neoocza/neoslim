import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    return logs[0] ?? null;
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return limit ? logs.slice(0, limit) : logs;
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    profileId: v.id("profiles"),
    stepsCount: v.optional(v.number()),
    kcalTotal: v.optional(v.number()),
    kcalBurned: v.optional(v.number()),
    deficitKcal: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, args);
      return existing[0]._id;
    }
    return await ctx.db.insert("dailyLogs", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyLogs"),
    stepsCount: v.optional(v.number()),
    kcalTotal: v.optional(v.number()),
    kcalBurned: v.optional(v.number()),
    deficitKcal: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});
