"use client";

// Foundations visualizer screen — seeds the store with the page's lesson and
// auto-runs the glass machine.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FoundationsCanvas } from "@/components/visualizer/FoundationsCanvas";
import { FoundationsControlsPanel } from "@/components/visualizer/FoundationsControlsPanel";
import { FoundationsNotesPanel } from "@/components/visualizer/FoundationsNotesPanel";
import { FoundationsSidebar } from "@/components/visualizer/FoundationsSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useFoundationsStore } from "@/lib/foundationsStore";
import type { FoundationsOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: FoundationsOperationId;
  defaultParams?: { value?: number };
}

export function FoundationsVisualizerScreen({ path, title, blurb, operation, defaultParams }: Props) {
  useEffect(() => {
    const store = useFoundationsStore.getState();
    store.setOperation(operation);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<FoundationsSidebar />} footer={<FoundationsControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <FoundationsCanvas />
      </main>
      <FoundationsNotesPanel />
    </AppShell>
  );
}
