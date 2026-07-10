"use client";

// Trees-topic visualizer screen for a leaf page. Seeds the store with the
// page's operation + data on mount and auto-runs.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { TreesCanvas } from "@/components/visualizer/TreesCanvas";
import { TreesControlsPanel } from "@/components/visualizer/TreesControlsPanel";
import { TreesNotesPanel } from "@/components/visualizer/TreesNotesPanel";
import { TreesSidebar } from "@/components/visualizer/TreesSidebar";
import { getTheory } from "@/data/theory";
import { useTreesStore } from "@/lib/treesStore";
import type { TreesOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: TreesOperationId;
  defaultData?: number[];
  defaultParams?: { value?: number; text?: string; words?: string[] };
}

export function TreesVisualizerScreen({ path, title, blurb, operation, defaultData, defaultParams }: Props) {
  useEffect(() => {
    const store = useTreesStore.getState();
    store.setOperation(operation);
    store.setValues(defaultData ?? []);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<TreesSidebar />} footer={<TreesControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <TreesCanvas />
      </main>
      <TreesNotesPanel />
    </AppShell>
  );
}
