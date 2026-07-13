"use client";

// OOP visualizer screen for a leaf concept page. Seeds the store with the
// page's operation on mount and auto-runs, then leaves the user free to replay,
// step, or switch language via the sidebar / notes rail.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OopsCanvas } from "@/components/visualizer/OopsCanvas";
import { OopsControlsPanel } from "@/components/visualizer/OopsControlsPanel";
import { OopsNotesPanel } from "@/components/visualizer/OopsNotesPanel";
import { OopsSidebar } from "@/components/visualizer/OopsSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useOopsStore } from "@/lib/oopsStore";
import type { OopsOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: OopsOperationId;
}

export function OopsVisualizerScreen({ path, title, blurb, operation }: Props) {
  useEffect(() => {
    const store = useOopsStore.getState();
    store.setOperation(operation);
    store.run(operation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<OopsSidebar />} footer={<OopsControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <OopsCanvas />
      </main>
      <OopsNotesPanel />
    </AppShell>
  );
}
