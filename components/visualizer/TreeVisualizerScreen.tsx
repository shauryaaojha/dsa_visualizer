"use client";

// Divide & conquer recursion-tree screen (merge sort / quick sort).

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecursionTreeCanvas } from "@/components/visualizer/RecursionTreeCanvas";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { TreeControlsPanel } from "@/components/visualizer/TreeControlsPanel";
import { TreeNotes } from "@/components/visualizer/TreeNotes";
import { TreeSidebar } from "@/components/visualizer/TreeSidebar";
import { useTreeStore } from "@/lib/treeStore";
import type { TreeOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: TreeOperationId;
  defaultData?: number[];
}

export function TreeVisualizerScreen({ path, title, blurb, operation, defaultData }: Props) {
  useEffect(() => {
    const store = useTreeStore.getState();
    store.setOperation(operation);
    if (defaultData) store.setValues(defaultData);
    store.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<TreeSidebar />} footer={<TreeControlsPanel />}>
      <main className="relative flex flex-1 items-stretch overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <div className="flex-1 pt-12">
          <RecursionTreeCanvas />
        </div>
      </main>
      <TreeNotes />
    </AppShell>
  );
}
