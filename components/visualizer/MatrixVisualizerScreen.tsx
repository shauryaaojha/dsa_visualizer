"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MatrixCanvas } from "@/components/visualizer/MatrixCanvas";
import { MatrixControlsPanel } from "@/components/visualizer/MatrixControlsPanel";
import { MatrixNotes } from "@/components/visualizer/MatrixNotes";
import { MatrixSidebar } from "@/components/visualizer/MatrixSidebar";
import { TopicHeader } from "@/components/visualizer/TopicHeader";
import { useMatrixStore } from "@/lib/matrixStore";
import type { MatrixOperationId } from "@/types/visualization";

interface Props {
  path: string;
  title: string;
  blurb: string;
  operation: MatrixOperationId;
  rows?: number;
  cols?: number;
  p?: number;
}

export function MatrixVisualizerScreen({ path, title, blurb, operation, rows = 3, cols = 3, p = 3 }: Props) {
  useEffect(() => {
    const store = useMatrixStore.getState();
    store.setOperation(operation);
    store.setDims(rows, cols, p);
    store.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <AppShell sidebar={<MatrixSidebar />} footer={<MatrixControlsPanel />}>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-16">
        <TopicHeader path={path} title={title} blurb={blurb} />
        <MatrixCanvas />
      </main>
      <MatrixNotes />
    </AppShell>
  );
}
