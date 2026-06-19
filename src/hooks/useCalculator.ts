import { useState, useCallback } from "react";
import type { UserFootprint } from "@/lib/eco/types";
import { useCarbonCalculator } from "@/hooks/useCarbonCalculator";
import { footprintSchema } from "@/lib/eco/schemas";

export const STEPS = ["Travel", "Home Energy", "Diet", "Consumption"] as const;

export function useCalculator(
  initialFootprint: UserFootprint,
  onSave: (f: UserFootprint) => void,
  onDone: () => void,
) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<UserFootprint>(initialFootprint);
  const [errors, setErrors] = useState<string[]>([]);

  const { totalTonnes } = useCarbonCalculator(draft);

  const update = useCallback(
    <K extends keyof UserFootprint>(key: K, patch: Partial<UserFootprint[K]>) => {
      setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));
    },
    [],
  );

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    const parsed = footprintSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
      return;
    }
    setErrors([]);
    onSave(parsed.data);
    onDone();
  }, [draft, onDone, onSave, step]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const jumpToStep = useCallback((i: number) => {
    setStep(i);
  }, []);

  return {
    step,
    draft,
    errors,
    totalTonnes,
    update,
    next,
    back,
    jumpToStep,
  };
}
