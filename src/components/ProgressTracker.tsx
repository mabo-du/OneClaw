import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Circle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROGRESS_SECTIONS, getSectionProgress, resetProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

export default function ProgressTracker() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const update = () => setProgress({ ...getSectionProgress() });
    update();
    window.addEventListener("progress-update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("progress-update", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const completed = PROGRESS_SECTIONS.filter(s => progress[s.key]).length;
  const total = PROGRESS_SECTIONS.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Setup Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {completed}/{total}
          </span>
          {completed > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => { resetProgress(); setProgress({}); }}
              title="Reset progress"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Section checklist */}
      <div className="space-y-2">
        {PROGRESS_SECTIONS.map(({ key, label, path }) => {
          const done = !!progress[key];
          return (
            <Link
              key={key}
              to={path}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                done
                  ? "text-success bg-success/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {done ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span className={cn(done && "line-through")}>{label}</span>
            </Link>
          );
        })}
      </div>

      {pct === 100 && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-sm font-medium text-success"
        >
          🎉 All sections complete!
        </motion.p>
      )}
    </div>
  );
}
