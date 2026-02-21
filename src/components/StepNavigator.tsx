import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepNavigatorProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  labels?: string[];
}

export default function StepNavigator({ current, total, onPrev, onNext, labels }: StepNavigatorProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={current === 0}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? "w-6 bg-primary"
                : i < current
                ? "w-2 bg-primary/40"
                : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={current === total - 1}
        className="gap-2"
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
