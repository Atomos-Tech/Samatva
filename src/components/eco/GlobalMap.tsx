import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import worldData from "@/lib/eco/worldData.json";

export interface WorldDataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  footprint: number;
}

/**
 * Returns a fill colour that encodes emissions intensity:
 *   > 10 t/yr → red (high impact)
 *   > 5  t/yr → amber (moderate)
 *   ≤ 5  t/yr → green (low)
 */
function footprintColor(footprint: number): string {
  if (footprint > 10) return "#ef4444";
  if (footprint > 5) return "#f59e0b";
  return "#10b981";
}

/**
 * Clamps the circle radius to a legible range derived from the square root
 * of the footprint value (so area ∝ emissions, not radius).
 */
function footprintRadius(footprint: number): number {
  return Math.max(4, Math.min(25, Math.sqrt(footprint) * 3));
}

export function GlobalMap() {
  /**
   * Pre-compute all marker JSX exactly once. The dependency array includes
   * `worldData` even though it is a static JSON import — it documents the
   * intent and prevents lint warnings about exhaustive-deps.
   */
  const markers = useMemo(
    () =>
      (worldData as WorldDataPoint[]).map((country) => (
        <CircleMarker
          key={country.id}
          center={[country.lat, country.lng]}
          radius={footprintRadius(country.footprint)}
          pathOptions={{
            color: "#ffffff",
            weight: 1.5,
            fillColor: footprintColor(country.footprint),
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <div className="text-slate-900 font-sans">
              <h3 className="font-semibold text-base m-0">{country.name}</h3>
              <p className="text-sm m-0 mt-1">
                <span className="font-bold text-emerald-600">{country.footprint} t</span> CO₂e / yr
              </p>
            </div>
          </Popup>
        </CircleMarker>
      )),
    // worldData is a static import — the array never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <section aria-labelledby="map-heading" className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex flex-wrap items-end justify-between gap-3 shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Global Impact
          </p>
          <h1
            id="map-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            Worldwide Footprints
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Explore the average per-capita carbon footprint (tonnes CO₂e) across the globe.
          </p>
        </div>
      </header>

      <div
        className="glass-card relative overflow-hidden rounded-3xl flex-1 border border-border/60 p-2"
        role="application"
        aria-label="Interactive global carbon footprint map"
      >
        <MapContainer
          center={[25, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", borderRadius: "1rem", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {markers}
        </MapContainer>

        {/* Screen-reader accessible data table as alternative to the visual map */}
        <div className="sr-only">
          <h2>Global Footprint Data Table</h2>
          <ul>
            {(worldData as WorldDataPoint[]).slice(0, 10).map((country) => (
              <li key={`sr-${country.id}`}>
                {country.name}: {country.footprint} tonnes of CO₂ equivalent per capita.
              </li>
            ))}
            <li>And {worldData.length - 10} more countries mapped visually.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
