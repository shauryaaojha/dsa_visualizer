"use client";

// Stack visualizer screen for a leaf topic page. Seeds the store with the
// page's operation + data on mount and auto-runs, then leaves the user free
// to replay or tweak via the sidebar.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StackCanvas } from "@/components/visualizer/StackCanvas";
import { StackControlsPanel } from "@/components/visualizer/StackControlsPanel";
import { StackNotes } from "@/components/visualizer/StackNotes";
import { StackSidebar } from "@/components/visualizer/StackSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useStackStore } from "@/lib/stackStore";
import type { StackOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: StackOperationId;
  defaultData?: number[];
  defaultParams?: { value?: number; text?: string; capacity?: number };
}

export function StackVisualizerScreen({ path, title, blurb, operation, defaultData, defaultParams }: Props) {
  useEffect(() => {
    const store = useStackStore.getState();
    store.setOperation(operation);
    if (defaultData) store.setValues(defaultData);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<StackSidebar />} footer={<StackControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <StackCanvas />
      </main>
      <StackNotes />
    </AppShell>
  );
}
