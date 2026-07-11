"use client";

// String visualizer screen — seeds the store with the page's problem + inputs
// and auto-runs.

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StringCanvas } from "@/components/visualizer/StringCanvas";
import { StringControlsPanel } from "@/components/visualizer/StringControlsPanel";
import { StringNotesPanel } from "@/components/visualizer/StringNotesPanel";
import { StringSidebar } from "@/components/visualizer/StringSidebar";
import { TheoryButton } from "@/components/visualizer/TheoryButton";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { getTheory } from "@/data/theory";
import { useStringStore } from "@/lib/stringStore";
import type { StringOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: StringOperationId;
  defaultParams?: { text?: string; text2?: string };
}

export function StringVisualizerScreen({ path, title, blurb, operation, defaultParams }: Props) {
  useEffect(() => {
    const store = useStringStore.getState();
    store.setOperation(operation);
    if (defaultParams) store.setParams(defaultParams);
    store.run(operation, defaultParams ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<StringSidebar />} footer={<StringControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <TheoryButton doc={getTheory(path)} />
        <StringCanvas />
      </main>
      <StringNotesPanel />
    </AppShell>
  );
}
