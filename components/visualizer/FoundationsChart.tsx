"use client";

// Live growth chart for the foundations complexity pages. Solid series are
// MEASURED costs (drawn point by point as the lesson plays, with the line
// re-tracing itself when a point lands); dashed series are ideal reference
// curves (n, n², log n…). Linear scale on purpose: watching n² leave the
// frame IS the lesson.

import { motion } from "framer-motion";
import type { FoundChart } from "@/types/visualization";

const W = 360;
const H = 190;
const PAD = { l: 40, r: 12, t: 10, b: 28 };

function niceMax(v: number): number {
  if (v <= 5) return 5;
  const mag = 10 ** Math.floor(Math.log10(v));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

export function FoundationsChart({ chart }: { chart: FoundChart }) {
  const allPoints = chart.series.flatMap((s) => s.points);
  const maxX = Math.max(2, ...allPoints.map((p) => p[0]));
  const rawMaxY = Math.max(2, ...allPoints.map((p) => p[1]));
  const maxY = niceMax(rawMaxY);

  const sx = (x: number) => PAD.l + (x / maxX) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - (Math.min(y, maxY) / maxY) * (H - PAD.t - PAD.b);

  const gridYs = [0.25, 0.5, 0.75, 1].map((f) => f * maxY);

  return (
    <div>
      {/* legend */}
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {chart.series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 font-mono text-[10px] text-on-surface-variant/80">
            <svg width="18" height="6">
              <line
                x1="0" y1="3" x2="18" y2="3"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? "4 3" : undefined}
              />
            </svg>
            {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={chart.title}>
        {/* grid + y labels */}
        {gridYs.map((gy) => (
          <g key={gy}>
            <line x1={PAD.l} y1={sy(gy)} x2={W - PAD.r} y2={sy(gy)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={PAD.l - 5} y={sy(gy) + 3} textAnchor="end" fontSize="8" fill="currentColor" fillOpacity="0.45" fontFamily="monospace">
              {gy >= 1000 ? `${Math.round(gy / 100) / 10}k` : Math.round(gy)}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="currentColor" strokeOpacity="0.25" />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="currentColor" strokeOpacity="0.25" />
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 8} textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity="0.5" fontFamily="monospace">
          {chart.xLabel}
        </text>
        <text
          x={10} y={(PAD.t + H - PAD.b) / 2}
          textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity="0.5" fontFamily="monospace"
          transform={`rotate(-90 10 ${(PAD.t + H - PAD.b) / 2})`}
        >
          {chart.yLabel}
        </text>

        {/* series */}
        {chart.series.map((s) => {
          if (s.points.length === 0) return null;
          const d = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");
          if (s.dashed) {
            return (
              <motion.path
                key={s.label}
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="1.5"
                strokeOpacity="0.55"
                strokeDasharray="5 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
            );
          }
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.label}>
              {s.points.length > 1 && (
                <motion.path
                  key={`${s.label}-${s.points.length}`}
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              )}
              {s.points.map((p, i) => (
                <motion.circle
                  key={`${p[0]}-${p[1]}-${i}`}
                  cx={sx(p[0])}
                  cy={sy(p[1])}
                  r={i === s.points.length - 1 ? 3.4 : 2.2}
                  fill={s.color}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                />
              ))}
              {/* pulse on the freshest point */}
              <motion.circle
                key={`pulse-${s.label}-${s.points.length}`}
                cx={sx(last[0])}
                cy={sy(last[1])}
                r={3.4}
                fill="none"
                stroke={s.color}
                strokeWidth="1.5"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
