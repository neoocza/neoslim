import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDailyLog = query({
  args: { dailyLogId: v.id("dailyLogs") },
  handler: async (ctx, { dailyLogId }) => {
    const entries = await ctx.db
      .query("foodEntries")
      .withIndex("by_dailyLog", (q) => q.eq("dailyLogId", dailyLogId))
      .collect();
    // Attach photo URLs
    return Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        photoUrl: entry.photoStorageId
          ? await ctx.storage.getUrl(entry.photoStorageId)
          : null,
      }))
    );
  },
});

export const listByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const log = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    if (log.length === 0) return [];
    const entries = await ctx.db
      .query("foodEntries")
      .withIndex("by_dailyLog", (q) => q.eq("dailyLogId", log[0]._id))
      .collect();
    return Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        photoUrl: entry.photoStorageId
          ? await ctx.storage.getUrl(entry.photoStorageId)
          : null,
      }))
    );
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("foodEntries", args);
    // Update the daily log's kcal total
    const entries = await ctx.db
      .query("foodEntries")
      .withIndex("by_dailyLog", (q) => q.eq("dailyLogId", args.dailyLogId))
      .collect();
    const total = entries.reduce((sum, e) => sum + e.kcalEstimate, 0);
    await ctx.db.patch(args.dailyLogId, { kcalTotal: total });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("foodEntries") },
  handler: async (ctx, { id }) => {
    const entry = await ctx.db.get(id);
    if (!entry) return;
    // Delete stored photo if exists
    if (entry.photoStorageId) {
      await ctx.storage.delete(entry.photoStorageId);
    }
    await ctx.db.delete(id);
    // Recalculate total
    const entries = await ctx.db
      .query("foodEntries")
      .withIndex("by_dailyLog", (q) => q.eq("dailyLogId", entry.dailyLogId))
      .collect();
    const total = entries.reduce((sum, e) => sum + e.kcalEstimate, 0);
    await ctx.db.patch(entry.dailyLogId, { kcalTotal: total });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
