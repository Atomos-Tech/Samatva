import { Car, Home, Utensils, ShoppingBag, Check, ArrowLeft, ArrowRight } from "lucide-react";
import type { AppState, UserFootprint } from "@/lib/eco/types";
import { sanitizeNumber } from "@/lib/eco/schemas";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalculator, STEPS } from "@/hooks/useCalculator";

const STEP_ICONS = [Car, Home, Utensils, ShoppingBag];

export function Calculator({
  state,
  onSave,
  onDone,
}: {
  state: AppState;
  onSave: (f: UserFootprint) => void;
  onDone: () => void;
}) {
  const { step, draft, errors, totalTonnes, update, next, back, jumpToStep } = useCalculator(
    state.footprint,
    onSave,
    onDone,
  );

  return (
    <section aria-labelledby="calc-heading" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1
            id="calc-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {STEPS[step]} footprint
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Adjust the values to match your lifestyle — the live counter updates instantly.
          </p>
        </div>
        <div
          data-testid="calculator-live-total"
          className="glass-card rounded-2xl px-5 py-3 text-right"
          aria-live="polite"
          aria-describedby="calc-live-help"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Live total
          </p>
          <p className="font-display text-2xl font-semibold text-primary tabular-nums">
            {totalTonnes.toFixed(2)}{" "}
            <span className="text-xs font-medium text-muted-foreground">t CO₂e / yr</span>
          </p>
          <span id="calc-live-help" className="sr-only">
            This estimate updates as you change inputs.
          </span>
        </div>
      </header>

      <ol className="flex items-center gap-2" aria-label="Wizard progress">
        {STEPS.map((s, i) => {
          const Icon = STEP_ICONS[i];
          const done = i < step;
          const active = i === step;
          return (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => jumpToStep(i)}
                aria-label={`Go to step ${i + 1}: ${s}`}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                      ? "border-forest/30 bg-sage-soft/40 text-forest-deep"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs font-semibold">
                  {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="glass-card space-y-6 rounded-2xl p-6">
        {step === 0 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <span className="font-semibold">Did you know?</span> A single long-haul flight can equal the emissions of commuting by car for an entire year.
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
            <SliderField
              id="carKm"
              label="Car distance per week"
              unit="km"
              max={2000}
              value={draft.travel.carKmPerWeek}
              onChange={(v) => update("travel", { carKmPerWeek: v })}
            />
            <SliderField
              id="transitKm"
              label="Public transit per week"
              unit="km"
              max={1000}
              value={draft.travel.publicTransitKmPerWeek}
              onChange={(v) => update("travel", { publicTransitKmPerWeek: v })}
            />
            <NumberField
              id="flights"
              label="Flights per year (return trips)"
              max={50}
              value={draft.travel.flightsPerYear}
              onChange={(v) => update("travel", { flightsPerYear: v })}
            />
          </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <span className="font-semibold">Did you know?</span> Switching to a 100% renewable energy tariff can instantly cut your home footprint by up to 80%.
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
            <NumberField
              id="elec"
              label="Electricity per month"
              unit="kWh"
              max={20000}
              value={draft.home.electricityKwhPerMonth}
              onChange={(v) => update("home", { electricityKwhPerMonth: v })}
            />
            <NumberField
              id="gas"
              label="Gas / heating per month"
              unit="kWh"
              max={20000}
              value={draft.home.gasKwhPerMonth}
              onChange={(v) => update("home", { gasKwhPerMonth: v })}
            />
            <SliderField
              id="renewable"
              label="Share from renewable tariff"
              unit="%"
              max={100}
              value={draft.home.renewablePercent}
              onChange={(v) => update("home", { renewablePercent: v })}
            />
          </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <span className="font-semibold">Did you know?</span> Producing 1kg of beef emits about 60kg of CO₂e, compared to just 1-2kg for most plant-based foods.
            </div>
            <div>
              <Label className="mb-2 block">Primary diet</Label>
              <div role="radiogroup" aria-label="Diet type" className="grid gap-2 sm:grid-cols-5">
                {(["vegan", "vegetarian", "pescatarian", "omnivore", "heavy_meat"] as const).map(
                  (d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={draft.diet.type === d}
                      data-testid={`diet-${d}`}
                      onClick={() => update("diet", { type: d })}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition focus:outline-none focus:ring-2 focus:ring-ring",
                        draft.diet.type === d
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {d.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>
            <SliderField
              id="waste"
              label="Food waste level (1 = none · 5 = high)"
              max={5}
              min={1}
              step={1}
              value={draft.diet.foodWasteLevel}
              onChange={(v) =>
                update("diet", { foodWasteLevel: Math.max(1, Math.min(5, v)) as 1 | 2 | 3 | 4 | 5 })
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <span className="font-semibold">Did you know?</span> Extending the life of your clothes by just 9 months reduces their carbon footprint by up to 30%.
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
            <SliderField
              id="shopping"
              label="Shopping intensity (1 = minimal · 5 = frequent)"
              max={5}
              min={1}
              step={1}
              value={draft.consumption.shoppingLevel}
              onChange={(v) =>
                update("consumption", {
                  shoppingLevel: Math.max(1, Math.min(5, v)) as 1 | 2 | 3 | 4 | 5,
                })
              }
            />
            <SliderField
              id="recycle"
              label="Share of waste recycled"
              unit="%"
              max={100}
              value={draft.consumption.recyclesPercent}
              onChange={(v) => update("consumption", { recyclesPercent: v })}
            />
          </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {errors.length > 0 && (
          <div
            role="alert"
            className="w-full rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-inside list-disc">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <Button
          variant="outline"
          type="button"
          onClick={back}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          type="button"
          data-testid="calculator-submit"
          onClick={next}
          className="gap-2 bg-primary hover:bg-forest-deep"
        >
          {step === STEPS.length - 1 ? "Save & view dashboard" : "Next"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

function SliderField({
  id,
  label,
  unit,
  value,
  onChange,
  max,
  min = 0,
  step = 1,
}: {
  id: string;
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  step?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-semibold tabular-nums text-primary">
          {value.toLocaleString()}
          {unit && <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>}
        </span>
      </div>
      <Slider
        id={id}
        data-testid={`slider-${id}`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        aria-label={label}
      />
    </div>
  );
}

function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  max,
}: {
  id: string;
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
        {unit && <span className="ml-1 text-xs text-muted-foreground">({unit})</span>}
      </Label>
      <Input
        id={id}
        data-testid={`input-${id}`}
        inputMode="numeric"
        type="text"
        maxLength={8}
        value={value === 0 ? "" : String(value)}
        placeholder="0"
        onChange={(e) => onChange(sanitizeNumber(e.target.value, max))}
        className="bg-card"
      />
    </div>
  );
}
