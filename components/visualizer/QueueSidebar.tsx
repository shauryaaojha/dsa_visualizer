"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { QUEUE_OPERATIONS, useQueueStore } from "@/lib/queueStore";
import type { QueueKind, QueueOperationId } from "@/types/visualization";

// Quick-tab → route subpath (under /topics/queues), grouped by queue kind.
const TABS: Record<QueueKind, { id: QueueOperationId; label: string; icon: string; subpath: string }[]> = {
  simple: [
    { id: "enqueue", label: "Enqueue", icon: "login", subpath: "simple-queue/array-implementation/enqueue" },
    { id: "dequeue", label: "Dequeue", icon: "logout", subpath: "simple-queue/array-implementation/dequeue" },
    { id: "qPeek", label: "Peek", icon: "visibility", subpath: "simple-queue/array-implementation/peek" },
  ],
  circular: [
    { id: "cEnqueue", label: "Enqueue", icon: "login", subpath: "circular-queue/enqueue" },
    { id: "cDequeue", label: "Dequeue", icon: "logout", subpath: "circular-queue/dequeue" },
    { id: "cOverflow", label: "Full Check", icon: "warning", subpath: "circular-queue/overflow-condition" },
  ],
  deque: [
    { id: "dqInsertFront", label: "Ins Front", icon: "first_page", subpath: "deque/insert-front" },
    { id: "dqInsertRear", label: "Ins Rear", icon: "last_page", subpath: "deque/insert-rear" },
    { id: "dqDeleteFront", label: "Del Front", icon: "backspace", subpath: "deque/delete-front" },
    { id: "dqDeleteRear", label: "Del Rear", icon: "cancel", subpath: "deque/delete-rear" },
  ],
  pqArray: [
    { id: "pqArrayDemo", label: "Array PQ", icon: "low_priority", subpath: "priority-queue/array-implementation" },
    { id: "pqHeapDemo", label: "Heap PQ", icon: "park", subpath: "priority-queue/heap-implementation" },
  ],
  pqHeap: [
    { id: "pqArrayDemo", label: "Array PQ", icon: "low_priority", subpath: "priority-queue/array-implementation" },
    { id: "pqHeapDemo", label: "Heap PQ", icon: "park", subpath: "priority-queue/heap-implementation" },
  ],
};

const KIND_LABEL: Record<QueueKind, string> = {
  simple: "Simple Queue · Array",
  circular: "Circular Queue",
  deque: "Deque",
  pqArray: "Priority Queue · Array",
  pqHeap: "Priority Queue · Heap",
};

export function QueueSidebar() {
  const router = useRouter();
  const kind = useQueueStore((s) => s.kind);
  const operation = useQueueStore((s) => s.operation);
  const values = useQueueStore((s) => s.values);
  const params = useQueueStore((s) => s.params);
  const setValues = useQueueStore((s) => s.setValues);
  const setParams = useQueueStore((s) => s.setParams);
  const randomize = useQueueStore((s) => s.randomize);
  const run = useQueueStore((s) => s.run);

  const meta = QUEUE_OPERATIONS.find((o) => o.id === operation);
  const tabs = TABS[kind];
  const hasCapacity = kind === "simple" || kind === "circular";

  const [text, setText] = useState(values.join(", "));
  const editingRef = useRef(false);
  useEffect(() => {
    if (!editingRef.current) setText(values.join(", "));
  }, [values]);

  function commit(t: string) {
    const nums = t
      .split(/[\s,]+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x))
      .slice(0, 10);
    if (nums.length) setValues(nums);
  }

  function handleRun() {
    commit(text);
    run(operation, params);
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="queue" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">{KIND_LABEL[kind]}</h2>
        </div>

        {/* Initial contents (front → rear) */}
        <div>
          <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">QUEUE (FRONT → REAR)</label>
          <div className="flex gap-1.5">
            <input
              value={text}
              onFocus={() => (editingRef.current = true)}
              onChange={(e) => setText(e.target.value)}
              onBlur={(e) => {
                editingRef.current = false;
                commit(e.target.value);
              }}
              spellCheck={false}
              className="min-w-0 flex-1 border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="10, 20, 30"
            />
            <button
              onClick={() => randomize(4)}
              title="Randomize"
              className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="shuffle" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Quick op tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">OPERATIONS</label>
          <div className="grid grid-cols-2 gap-1">
            {tabs.map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/queues/${t.subpath}`)}
                  title={t.label}
                  className={`flex flex-col items-center gap-0.5 border px-1 py-1.5 transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                  }`}
                >
                  <Icon name={t.icon} className="text-[16px]" />
                  <span className="text-center font-label-caps text-[8px] leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Params */}
        <div className="flex gap-2">
          {meta?.params.includes("value") && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">VALUE</label>
              <input
                type="number"
                value={params.value}
                onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          )}
          {meta?.params.includes("priority") && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">PRIORITY</label>
              <input
                type="number"
                min={1}
                max={9}
                value={params.priority}
                onChange={(e) => setParams({ priority: parseInt(e.target.value, 10) || 1 })}
                className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          )}
          {hasCapacity && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">CAPACITY</label>
              <input
                type="number"
                min={4}
                max={10}
                value={params.capacity}
                onChange={(e) => setParams({ capacity: parseInt(e.target.value, 10) || 6 })}
                className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {meta && <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>}

        <button
          onClick={handleRun}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Re-run
        </button>
      </div>
    </aside>
  );
}
