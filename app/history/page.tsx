"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  ChevronDown,
  ChevronUp,
  Footprints,
  Flame,
  TrendingDown,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Droplets,
  X,
} from "lucide-react";

const categoryIcon = {
  meal: UtensilsCrossed,
  drink: Coffee,
  snack: Cookie,
};

function DayCard({ log }: { log: { _id: Id<"dailyLogs">; date: string; stepsCount?: number; kcalTotal?: number; deficitKcal?: number; kcalBurned?: number; waterGlasses?: number; notes?: string } }) {
  const [open, setOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("Photo");
  const foodEntries = useQuery(
    api.foodEntries.listByDailyLog,
    open ? { dailyLogId: log._id } : "skip"
  );

  const dayLabel = new Date(log.date + "T12:00:00").toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-2xl bg-card-bg border border-card-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <div className="text-sm font-semibold">{dayLabel}</div>
          <div className="text-xs text-muted mt-0.5">
            {log.kcalTotal ?? 0} kcal
            {log.stepsCount != null && ` · ${log.stepsCount.toLocaleString()} steps`}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {log.deficitKcal != null && log.deficitKcal > 0 && (
            <span className="text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded-full">
              -{log.deficitKcal} deficit
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-muted" />
          ) : (
            <ChevronDown size={16} className="text-muted" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-card-border px-4 pb-4 pt-3 space-y-3">
          {/* Mini stats */}
          <div className="flex gap-4 text-xs text-muted">
            {log.stepsCount != null && (
              <span className="flex items-center gap-1">
                <Footprints size={12} /> {log.stepsCount.toLocaleString()}
              </span>
            )}
            {log.kcalBurned != null && (
              <span className="flex items-center gap-1">
                <Flame size={12} /> {log.kcalBurned} burned
              </span>
            )}
            {log.deficitKcal != null && (
              <span className="flex items-center gap-1">
                <TrendingDown size={12} /> {log.deficitKcal} deficit
              </span>
            )}
            {log.waterGlasses != null && log.waterGlasses > 0 && (
              <span className="flex items-center gap-1">
                <Droplets size={12} /> {log.waterGlasses} glasses
              </span>
            )}
          </div>
          {log.notes && (
            <div className="text-xs text-muted italic">{log.notes}</div>
          )}

          {/* Food entries */}
          {foodEntries === undefined ? (
            <div className="text-xs text-muted">Loading entries...</div>
          ) : foodEntries.length === 0 ? (
            <div className="text-xs text-muted">No food entries logged.</div>
          ) : (
            <div className="space-y-2">
              {foodEntries.map((entry) => {
                const Icon =
                  categoryIcon[entry.category as keyof typeof categoryIcon] ??
                  UtensilsCrossed;
                return (
                  <div key={entry._id} className="flex items-center gap-2">
                    {entry.photoUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxUrl(entry.photoUrl!);
                          setLightboxAlt(entry.item);
                        }}
                        className="w-6 h-6 rounded overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent/40"
                        aria-label={`Open photo for ${entry.item}`}
                      >
                        <img
                          src={entry.photoUrl}
                          alt={entry.item}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <Icon size={12} className="text-muted flex-shrink-0" />
                    )}
                    <span className="text-xs flex-1 truncate">
                      {entry.timeLocal} — {entry.item}
                    </span>
                    <span className="text-xs font-semibold text-accent">
                      {entry.kcalEstimate}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close photo"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt={lightboxAlt}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function History() {
  const dailyLogs = useQuery(api.dailyLogs.list, {});

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">History</h1>

      {dailyLogs === undefined ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : dailyLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No daily logs yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dailyLogs.map((log) => (
            <DayCard key={log._id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
