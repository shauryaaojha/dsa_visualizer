"use client";

// Full array visualizer screen for a leaf topic page. Seeds the store with the
// topic's operation + data on mount and auto-runs it, then leaves the user free
// to replay or tweak via the sidebar.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { InstructorNotes } from "@/components/visualizer/InstructorNotes";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { VisualizerCanvas } from "@/components/visualizer/VisualizerCanvas";
import { useVisualizerStore } from "@/lib/visualizerStore";
import type { ArrayOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: ArrayOperationId;
  defaultData: number[];
  defaultParams?: { index?: number; value?: number };
}

export function ArrayVisualizerScreen({ path, title, blurb, operation, defaultData, defaultParams }: Props) {
  useEffect(() => {
    const store = useVisualizerStore.getState();
    store.setBaseArray(defaultData);
    store.setOperation(operation);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // Re-seed whenever the target topic changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <VisualizerCanvas />
      </main>
      <InstructorNotes />
    </AppShell>
  );
}
