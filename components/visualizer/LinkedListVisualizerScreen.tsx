"use client";

// Linked-list visualizer screen for a leaf topic page. Seeds the store with the
// page's kind + operation + data on mount and auto-runs, then leaves the user
// free to replay or tweak via the sidebar.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LinkedListCanvas } from "@/components/visualizer/LinkedListCanvas";
import { LinkedListControlsPanel } from "@/components/visualizer/LinkedListControlsPanel";
import { LinkedListNotes } from "@/components/visualizer/LinkedListNotes";
import { LinkedListSidebar } from "@/components/visualizer/LinkedListSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useLinkedListStore } from "@/lib/linkedListStore";
import type { LLKind, LLOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  kind: LLKind;
  operation: LLOperationId;
  defaultData?: number[];
  defaultParams?: { index?: number; value?: number };
}

export function LinkedListVisualizerScreen({
  path,
  title,
  blurb,
  kind,
  operation,
  defaultData,
  defaultParams,
}: Props) {
  useEffect(() => {
    const store = useLinkedListStore.getState();
    store.setKind(kind);
    store.setOperation(operation);
    if (defaultData) store.setValues(defaultData);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<LinkedListSidebar />} footer={<LinkedListControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <LinkedListCanvas />
      </main>
      <LinkedListNotes />
    </AppShell>
  );
}
