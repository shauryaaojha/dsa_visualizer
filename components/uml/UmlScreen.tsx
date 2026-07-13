"use client";

// Full page for the UML leaf pages. Left rail: preset picker + a legend whose
// checkboxes toggle each relationship kind's visibility. Centre: the reactflow
// canvas. Right rail: the clicked node's description, or the current build-step
// narration. Footer: the shared TransportBar stepping through buildSteps.

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UmlCanvas } from "@/components/uml/UmlCanvas";
import { Icon } from "@/components/ui/Icon";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { TransportBar } from "@/components/visualizer/TransportBar";
import { getTheory } from "@/data/theory";
import { ALL_DIAGRAMS, RELATION_INFO, type UmlEdgeKind } from "@/data/umlDiagrams";
import { useUmlStore } from "@/lib/umlStore";

interface Props {
  path: string;
  title: string;
  blurb: string;
  presetIds: string[];
  defaultPreset: string;
}

function UmlControls() {
  const diagram = useUmlStore((s) => s.diagram);
  const stepIndex = useUmlStore((s) => s.stepIndex);
  const isPlaying = useUmlStore((s) => s.isPlaying);
  const speed = useUmlStore((s) => s.speed);
  return (
    <TransportBar
      hasProgram={!!diagram}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={diagram?.buildSteps.length ?? 0}
      complexity={null}
      speed={speed}
      onToggle={useUmlStore.getState().togglePlay}
      onForward={useUmlStore.getState().stepForward}
      onBack={useUmlStore.getState().stepBack}
      onStart={useUmlStore.getState().toStart}
      onEnd={useUmlStore.getState().toEnd}
      onSpeedChange={useUmlStore.getState().setSpeed}
    />
  );
}

function UmlSidebar({ presetIds }: { presetIds: string[] }) {
  const diagram = useUmlStore((s) => s.diagram);
  const hiddenKinds = useUmlStore((s) => s.hiddenKinds);
  const load = useUmlStore((s) => s.load);
  const toggleKind = useUmlStore((s) => s.toggleKind);

  const presets = presetIds.map((id) => ALL_DIAGRAMS.find((d) => d.id === id)!).filter(Boolean);

  // Relation kinds actually present in the current diagram.
  const kinds = useMemo(() => {
    if (!diagram) return [] as UmlEdgeKind[];
    return Array.from(new Set(diagram.edges.map((e) => e.kind)));
  }, [diagram]);

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="schema" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">UML Diagrams</h2>
        </div>

        {presets.length > 1 && (
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">EXAMPLE</label>
            <div className="flex flex-col gap-1">
              {presets.map((p) => {
                const selected = diagram?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => load(p.id)}
                    className={`border px-2 py-1.5 text-left font-code-snippet text-[11px] transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {kinds.length > 0 && (
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">RELATIONSHIPS</label>
            <div className="flex flex-col gap-1.5">
              {kinds.map((k) => {
                const info = RELATION_INFO[k];
                const hidden = hiddenKinds.includes(k);
                return (
                  <button
                    key={k}
                    onClick={() => toggleKind(k)}
                    className="flex items-start gap-2 text-left"
                    title={info.meaning}
                  >
                    <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${hidden ? "border-outline-variant" : "border-primary bg-primary/20"}`}>
                      {!hidden && <Icon name="check" className="text-[11px] text-primary" />}
                    </span>
                    <span className={`font-code-snippet text-[11px] leading-tight ${hidden ? "text-on-surface-variant/40 line-through" : "text-on-surface-variant"}`}>
                      <span className="text-on-surface">{info.label}</span>
                      <span className="block text-[9px] text-on-surface-variant/60">{info.line}, {info.head}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-auto font-body-sm text-[10px] text-on-surface-variant/60">
          Drag nodes to rearrange · scroll to zoom · click a node for details · step through to build it up.
        </p>
      </div>
    </aside>
  );
}

function UmlInfoRail() {
  const diagram = useUmlStore((s) => s.diagram);
  const stepIndex = useUmlStore((s) => s.stepIndex);
  const selectedNodeId = useUmlStore((s) => s.selectedNodeId);

  const selected = diagram?.nodes.find((n) => n.id === selectedNodeId);
  const step = diagram?.buildSteps[Math.min(stepIndex, (diagram?.buildSteps.length ?? 1) - 1)];

  return (
    <aside className="z-40 hidden w-80 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low/80 backdrop-blur-xl lg:flex h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant px-md py-3 shrink-0">
        <h3 className="flex items-center gap-2 font-label-caps text-label-caps text-primary">
          <Icon name="school" className="text-[16px]" /> Instructor Notes
        </h3>
        {diagram && (
          <span className="font-mono text-[11px] text-on-surface-variant/60">
            {stepIndex + 1}/{diagram.buildSteps.length}
          </span>
        )}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto p-md space-y-4">
        <div>
          <p className="mb-1 font-label-caps text-[10px] text-on-surface-variant/60">BUILD STEP</p>
          <div className="border border-coral bg-surface-container p-sm">
            <p className="font-code-snippet text-code-snippet text-coral">{step?.description}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 font-label-caps text-[10px] text-on-surface-variant/60">
            {selected ? "SELECTED NODE" : "TIP"}
          </p>
          {selected ? (
            <div className="border border-outline-variant bg-surface-container p-sm">
              <p className="mb-1 font-code-snippet text-[13px] font-bold text-on-surface">
                {selected.data.stereotype ? `«${selected.data.stereotype}» ` : ""}
                {selected.data.name}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                {selected.data.description ?? "No description."}
              </p>
            </div>
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant/60">
              Click any box or oval on the canvas to read what it represents.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function UmlScreen({ path, title, blurb, presetIds, defaultPreset }: Props) {
  useEffect(() => {
    useUmlStore.getState().load(defaultPreset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<UmlSidebar presetIds={presetIds} />} footer={<UmlControls />}>
      <main className="relative flex flex-1 overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <div className="absolute inset-0 pt-16">
          <UmlCanvas />
        </div>
      </main>
      <UmlInfoRail />
    </AppShell>
  );
}
