"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ARRAY_OPERATIONS, useVisualizerStore } from "@/lib/visualizerStore";

const OP_ROUTES: Record<string, string> = {
  traverse:      "/topics/arrays/basic-operations/traversal",
  access:        "/topics/arrays/basic-operations/traversal",
  update:        "/topics/arrays/basic-operations/updating",
  insert:        "/topics/arrays/basic-operations/insertion",
  delete:        "/topics/arrays/basic-operations/deletion",
  reverse:       "/topics/arrays/basic-operations/traversal",
  linearSearch:  "/topics/arrays/searching/linear-search",
  binarySearch:  "/topics/arrays/searching/binary-search",
  bubbleSort:    "/topics/arrays/sorting/bubble-sort",
  selectionSort: "/topics/arrays/sorting/selection-sort",
  insertionSort: "/topics/arrays/sorting/insertion-sort",
  mergeSort:     "/topics/arrays/sorting/merge-sort",
  quickSort:     "/topics/arrays/sorting/quick-sort",
  prefixSum:     "/topics/arrays/advanced-array/prefix-sum",
  slidingWindow: "/topics/arrays/advanced-array/sliding-window",
  twoPointer:    "/topics/arrays/advanced-array/two-pointer",
  kadane:           "/topics/arrays/patterns/maximum-subarray",
  maxProfit:        "/topics/arrays/patterns/best-time-stock",
  moveZeroes:       "/topics/arrays/patterns/move-zeroes",
  maxArea:          "/topics/arrays/patterns/container-most-water",
  sortColors:       "/topics/arrays/patterns/sort-colors",
  removeDuplicates: "/topics/arrays/patterns/remove-duplicates",
  majorityElement:  "/topics/arrays/patterns/majority-element",
};

export function QuickOpTabs() {
  const router = useRouter();
  const operation = useVisualizerStore((s) => s.operation);

  return (
    <div>
      <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">
        OPERATIONS
      </label>
      <div className="grid grid-cols-3 gap-1">
        {ARRAY_OPERATIONS.map((op) => {
          const selected = op.id === operation;
          return (
            <button
              key={op.id}
              onClick={() => { const r = OP_ROUTES[op.id]; if (r) router.push(r); }}
              title={op.hint}
              className={`flex flex-col items-center gap-0.5 border px-1 py-1.5 text-[11px] transition-colors ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
              }`}
            >
              <Icon name={op.icon} className="text-[16px]" />
              <span className="text-center font-label-caps text-[8px] leading-tight">{op.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
