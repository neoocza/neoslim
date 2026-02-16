import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("profiles").collect();
    if (existing.length > 0) return "Already seeded";

    // Create profile
    const profileId = await ctx.db.insert("profiles", {
      name: "Jaco",
      age: 46,
      sex: "male",
      heightCm: 178,
      startWeightKg: 90,
      goalWeightKg: 77,
      tdeeKcal: 2550,
      bmrKcal: 1820,
      dailyCalorieMin: 1900,
      dailyCalorieMax: 2000,
      dailyProteinTargetG: 160,
      dailyStepTarget: 7000,
      dailyWaterGlassTarget: 8,
      ifWindow: "lunch + dinner",
      cheatMealsPerWeek: 2,
    });

    // Seed weight entry (starting weight)
    await ctx.db.insert("weightEntries", {
      date: "2026-02-15",
      weightKg: 90,
      profileId,
    });

    // Create daily log for Feb 16
    const dailyLogId = await ctx.db.insert("dailyLogs", {
      date: "2026-02-16",
      profileId,
      stepsCount: 2245,
      kcalTotal: 1745,
      kcalBurned: 2525,
      deficitKcal: 780,
      notes: "First tracked day",
    });

    // Seed food entries for Feb 16
    const entries = [
      {
        timeLocal: "08:29",
        item: "Seattle Coffee tall cappuccino",
        details: "full cream milk, no sugar",
        kcalEstimate: 170,
        kcalRangeLow: 150,
        kcalRangeHigh: 190,
        proteinG: 9,
        carbsG: 14,
        fatsG: 9,
        category: "drink" as const,
      },
      {
        timeLocal: "09:00",
        item: "Tea",
        details: "full cream milk + 1/2 tsp sugar",
        kcalEstimate: 25,
        proteinG: 1,
        carbsG: 3,
        fatsG: 1,
        category: "drink" as const,
      },
      {
        timeLocal: "13:30",
        item: "Restaurant lunch",
        details:
          "grilled chicken + avocado + greek-style side salad + small pumpkin/butternut portion; left part of meal",
        kcalEstimate: 690,
        kcalRangeLow: 600,
        kcalRangeHigh: 780,
        proteinG: 52,
        carbsG: 30,
        fatsG: 38,
        category: "meal" as const,
      },
      {
        timeLocal: "14:10",
        item: "Seattle Coffee tall cappuccino + Coke Zero",
        details: "full cream milk, no sugar",
        kcalEstimate: 170,
        kcalRangeLow: 150,
        kcalRangeHigh: 190,
        proteinG: 9,
        carbsG: 14,
        fatsG: 9,
        category: "drink" as const,
      },
      {
        timeLocal: "15:30",
        item: "Dry wors stick",
        kcalEstimate: 70,
        proteinG: 6,
        carbsG: 0,
        fatsG: 5,
        category: "snack" as const,
      },
      {
        timeLocal: "19:00",
        item: "Spaghetti bolognese + cheese",
        details: "left about 1/3 on plate",
        kcalEstimate: 620,
        kcalRangeLow: 520,
        kcalRangeHigh: 700,
        proteinG: 32,
        carbsG: 55,
        fatsG: 24,
        category: "meal" as const,
      },
      {
        timeLocal: "21:00",
        item: "Rooibos tea",
        details: "milk + 1/2 tsp honey",
        kcalEstimate: 30,
        kcalRangeLow: 25,
        kcalRangeHigh: 35,
        proteinG: 1,
        carbsG: 5,
        fatsG: 0,
        category: "drink" as const,
      },
    ];

    for (const entry of entries) {
      await ctx.db.insert("foodEntries", {
        dailyLogId,
        ...entry,
      });
    }

    return "Seeded successfully";
  },
});
