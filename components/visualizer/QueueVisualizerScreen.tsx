"use client";

// Queue visualizer screen for a leaf topic page. Seeds the store with the
// page's kind + operation + data on mount and auto-runs.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QueueCanvas } from "@/components/visualizer/QueueCanvas";
import { QueueControlsPanel } from "@/components/visualizer/QueueControlsPanel";
import { QueueNotes } from "@/components/visualizer/QueueNotes";
import { QueueSidebar } from "@/components/visualizer/QueueSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useQueueStore } from "@/lib/queueStore";
import type { QueueKind, QueueOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  kind: QueueKind;
  operation: QueueOperationId;
  defaultData?: number[];
  defaultParams?: { value?: number; priority?: number; capacity?: number };
}

export function QueueVisualizerScreen({ path, title, blurb, kind, operation, defaultData, defaultParams }: Props) {
  useEffect(() => {
    const store = useQueueStore.getState();
    store.setKind(kind);
    store.setOperation(operation);
    if (defaultData) store.setValues(defaultData);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<QueueSidebar />} footer={<QueueControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <QueueCanvas />
      </main>
      <QueueNotes />
    </AppShell>
  );
}
