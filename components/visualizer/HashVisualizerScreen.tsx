"use client";

// Hashing visualizer screen for a leaf topic page. Seeds the store with the
// page's operation + data on mount and auto-runs, then leaves the user free
// to replay or tweak keys / table size via the sidebar.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HashCanvas } from "@/components/visualizer/HashCanvas";
import { HashControlsPanel } from "@/components/visualizer/HashControlsPanel";
import { HashNotes } from "@/components/visualizer/HashNotes";
import { HashSidebar } from "@/components/visualizer/HashSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useHashStore } from "@/lib/hashStore";
import type { HashOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: HashOperationId;
  defaultData?: number[];
  defaultParams?: { key?: number; text?: string; m?: number };
}

export function HashVisualizerScreen({ path, title, blurb, operation, defaultData, defaultParams }: Props) {
  useEffect(() => {
    const store = useHashStore.getState();
    store.setOperation(operation);
    if (defaultData) store.setValues(defaultData);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<HashSidebar />} footer={<HashControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <HashCanvas />
      </main>
      <HashNotes />
    </AppShell>
  );
}
