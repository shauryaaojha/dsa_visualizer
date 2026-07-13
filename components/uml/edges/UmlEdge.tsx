"use client";

// One custom edge for all eight UML relationship kinds. It floats: instead of
// anchoring to fixed handles, it computes border-to-border geometry from the
// two nodes' rectangles (so arrows always point cleanly regardless of layout),
// then renders the correct end marker as a rotated SVG polygon:
//
//   inheritance / realization → hollow triangle at the TARGET (parent/interface)
//   composition               → filled diamond at the SOURCE (the whole)
//   aggregation               → hollow diamond at the SOURCE
//   association/dependency/
//   include/extend            → open arrowhead at the TARGET
//
// Dashed line for realization, dependency, include and extend. Hollow shapes
// are filled with the page surface colour (a plain markerEnd URL can't do that).

import { EdgeLabelRenderer, useStore, type EdgeProps } from "reactflow";
import { RELATION_INFO, type UmlEdgeKind } from "@/data/umlDiagrams";

const SURFACE = "#1b1714"; // fill for hollow markers, matches the dark canvas
const STROKE = "#8a9099";
const STROKE_LIT = "#F5A623";

interface Rect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

function rectOf(node: { positionAbsolute?: { x: number; y: number }; position: { x: number; y: number }; width?: number | null; height?: number | null }): Rect {
  const x = node.positionAbsolute?.x ?? node.position.x;
  const y = node.positionAbsolute?.y ?? node.position.y;
  const w = node.width ?? 150;
  const h = node.height ?? 70;
  return { cx: x + w / 2, cy: y + h / 2, w, h };
}

/** Point where the line from rect's centre toward (tx,ty) crosses its border. */
function border(rect: Rect, tx: number, ty: number): { x: number; y: number } {
  const dx = tx - rect.cx;
  const dy = ty - rect.cy;
  if (dx === 0 && dy === 0) return { x: rect.cx, y: rect.cy };
  const sx = dx !== 0 ? rect.w / 2 / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? rect.h / 2 / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: rect.cx + dx * s, y: rect.cy + dy * s };
}

function rotatePoints(pts: [number, number][], cx: number, cy: number, angle: number): string {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return pts
    .map(([px, py]) => {
      const x = cx + px * cos - py * sin;
      const y = cy + px * sin + py * cos;
      return `${x},${y}`;
    })
    .join(" ");
}

export function UmlEdge({ source, target, data, selected }: EdgeProps<{ kind: UmlEdgeKind; label?: string }>) {
  const sourceNode = useStore((s) => s.nodeInternals.get(source));
  const targetNode = useStore((s) => s.nodeInternals.get(target));
  if (!sourceNode || !targetNode) return null;

  const kind = data?.kind ?? "association";
  const info = RELATION_INFO[kind];
  const dashed = info.line === "dashed";

  const sRect = rectOf(sourceNode);
  const tRect = rectOf(targetNode);
  const sPt = border(sRect, tRect.cx, tRect.cy);
  const tPt = border(tRect, sRect.cx, sRect.cy);

  const stroke = selected ? STROKE_LIT : STROKE;

  // Which end carries the primary marker.
  const diamondAtSource = kind === "composition" || kind === "aggregation";
  const triangleAtTarget = kind === "inheritance" || kind === "realization";
  const arrowAtTarget = kind === "association" || kind === "dependency" || kind === "include" || kind === "extend";

  // Angles pointing INTO the marker tip.
  const angleTarget = Math.atan2(tPt.y - sPt.y, tPt.x - sPt.x); // toward target
  const angleSource = Math.atan2(sPt.y - tPt.y, sPt.x - tPt.x); // toward source

  // Pull the line back so it meets the marker base, not the tip.
  const pull = 14;
  let ex = tPt.x;
  let ey = tPt.y;
  if (triangleAtTarget || arrowAtTarget) {
    ex = tPt.x - Math.cos(angleTarget) * (triangleAtTarget ? pull : 8);
    ey = tPt.y - Math.sin(angleTarget) * (triangleAtTarget ? pull : 8);
  }
  let bx = sPt.x;
  let by = sPt.y;
  if (diamondAtSource) {
    bx = sPt.x - Math.cos(angleSource) * 16;
    by = sPt.y - Math.sin(angleSource) * 16;
  }

  const path = `M ${bx} ${by} L ${ex} ${ey}`;
  const midX = (sPt.x + tPt.x) / 2;
  const midY = (sPt.y + tPt.y) / 2;

  return (
    <>
      <path d={path} fill="none" stroke={stroke} strokeWidth={selected ? 2.4 : 1.6} strokeDasharray={dashed ? "6 4" : undefined} />

      {/* Hollow triangle at target (inheritance / realization) */}
      {triangleAtTarget && (
        <polygon
          points={rotatePoints([[0, 0], [-pull, -7], [-pull, 7]], tPt.x, tPt.y, angleTarget)}
          fill={SURFACE}
          stroke={stroke}
          strokeWidth={1.6}
        />
      )}

      {/* Open arrowhead at target (association / dependency / include / extend) */}
      {arrowAtTarget && (
        <polyline
          points={rotatePoints([[-9, -5], [0, 0], [-9, 5]], tPt.x, tPt.y, angleTarget)}
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Diamond at source (composition filled / aggregation hollow) */}
      {diamondAtSource && (
        <polygon
          points={rotatePoints([[0, 0], [-8, -5], [-16, 0], [-8, 5]], sPt.x, sPt.y, angleSource)}
          fill={kind === "composition" ? stroke : SURFACE}
          stroke={stroke}
          strokeWidth={1.6}
        />
      )}

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              pointerEvents: "none",
            }}
            className="rounded border border-outline-variant/60 bg-surface-container/90 px-1.5 py-0.5 font-mono text-[9px] text-on-surface-variant"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
