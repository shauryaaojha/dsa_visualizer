"use client";

// Graph visualizer screen for a leaf page. Seeds the store with the page's
// operation + start node on mount and auto-runs.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GraphCanvas } from "@/components/visualizer/GraphCanvas";
import { GraphControlsPanel } from "@/components/visualizer/GraphControlsPanel";
import { GraphNotesPanel } from "@/components/visualizer/GraphNotesPanel";
import { GraphSidebar } from "@/components/visualizer/GraphSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useGraphStore } from "@/lib/graphStore";
import type { GraphOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: GraphOperationId;
  defaultParams?: { start?: string };
}

export function GraphVisualizerScreen({ path, title, blurb, operation, defaultParams }: Props) {
  useEffect(() => {
    const store = useGraphStore.getState();
    store.setOperation(operation);
    if (defaultParams?.start) store.setParams({ start: defaultParams.start });
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<GraphSidebar />} footer={<GraphControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <GraphCanvas />
      </main>
      <GraphNotesPanel />
    </AppShell>
  );
}
