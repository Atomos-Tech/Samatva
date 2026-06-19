import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar, type ViewKey } from "@/components/eco/Sidebar";
import { Dashboard } from "@/components/eco/Dashboard";
import { Calculator } from "@/components/eco/Calculator";
import { ActionHub } from "@/components/eco/ActionHub";
import { Insights } from "@/components/eco/Insights";
import { GlobalMap } from "@/components/eco/GlobalMap";
import { useAppState, todayKey } from "@/lib/eco/store";
import type { EcoAction, UserFootprint } from "@/lib/eco/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samatva — Carbon Footprint Awareness Platform" },
      {
        name: "description",
        content:
          "Calculate, track and shrink your carbon footprint with personalised insights, daily eco-challenges, and a beautiful impact dashboard.",
      },
      { property: "og:title", content: "Samatva — Carbon Footprint Awareness Platform" },
      {
        property: "og:description",
        content:
          "Calculate, track and shrink your carbon footprint with personalised insights and daily eco-challenges.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, setState, hydrated } = useAppState();
  const [viewState, setViewState] = useState<ViewKey>("dashboard");

  const view = !state.onboarded ? "calculator" : viewState;

  function setView(v: ViewKey) {
    if (!state.onboarded && v !== "calculator") {
      toast.info("Please calculate your footprint first.");
      return;
    }
    setViewState(v);
  }

  function saveFootprint(footprint: UserFootprint) {
    setState((s) => ({ ...s, footprint, onboarded: true }));
  }

  function logAction(action: EcoAction) {
    const date = todayKey();
    setState((s) => {
      const isLogged = s.log.some((l) => l.actionId === action.id && l.date === date);
      if (isLogged) {
        return {
          ...s,
          points: Math.max(0, s.points - action.points),
          log: s.log.filter((l) => !(l.actionId === action.id && l.date === date)),
        };
      }
      return {
        ...s,
        points: s.points + action.points,
        log: [...s.log, { actionId: action.id, date }],
      };
    });
  }

  function togglePlan(tipId: string) {
    setState((s) => {
      const planned = s.planned || [];
      const isPlanned = planned.includes(tipId);
      if (isPlanned) {
        return { ...s, planned: planned.filter((id) => id !== tipId) };
      }
      return { ...s, planned: [...planned, tipId] };
    });
  }

  return (
    <div className="flex min-h-dvh w-full flex-col md:flex-row">
      <Sidebar view={view} onChange={setView} />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-6xl">
          {!hydrated ? (
            <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
              Loading your impact…
            </div>
          ) : view === "dashboard" ? (
            <Dashboard state={state} />
          ) : view === "calculator" ? (
            <Calculator state={state} onSave={saveFootprint} onDone={() => setView("dashboard")} />
          ) : view === "actions" ? (
            <ActionHub state={state} onLog={logAction} />
          ) : view === "map" ? (
            <GlobalMap />
          ) : (
            <Insights state={state} onTogglePlan={togglePlan} />
          )}
        </div>
      </main>
      <Toaster position="top-right" richColors closeButton theme="light" />
    </div>
  );
}
