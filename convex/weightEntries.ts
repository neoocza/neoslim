import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const entries = await ctx.db
      .query("weightEntries")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return limit ? entries.slice(0, limit) : entries;
  },
});

export const latest = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("weightEntries")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return entries[0] ?? null;
  },
});

export const add = mutation({
  args: {
    date: v.string(),
    weightKg: v.number(),
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Upsert by date
    const existing = await ctx.db
      .query("weightEntries")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, { weightKg: args.weightKg });
      return existing[0]._id;
    }
    return await ctx.db.insert("weightEntries", args);
  },
});
