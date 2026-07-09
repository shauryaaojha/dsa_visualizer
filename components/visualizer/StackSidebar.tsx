"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { STACK_OPERATIONS, useStackStore } from "@/lib/stackStore";
import type { StackOperationId } from "@/types/visualization";

// Quick-tab → route subpath (under /topics/stacks).
const ARRAY_TABS: { id: StackOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "push", label: "Push", icon: "add_box", subpath: "array-implementation/push" },
  { id: "pop", label: "Pop", icon: "remove", subpath: "array-implementation/pop" },
  { id: "peek", label: "Peek", icon: "visibility", subpath: "array-implementation/peek" },
  { id: "overflowUnderflow", label: "Ovf / Unf", icon: "warning", subpath: "array-implementation/overflow-underflow" },
];

const LIST_TABS: { id: StackOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "llPush", label: "Push", icon: "add_box", subpath: "linked-list-implementation/push" },
  { id: "llPop", label: "Pop", icon: "remove", subpath: "linked-list-implementation/pop" },
  { id: "llPeek", label: "Peek", icon: "visibility", subpath: "linked-list-implementation/peek" },
];

const APP_LABEL: Partial<Record<StackOperationId, string>> = {
  balancedParens: "Balanced Parentheses",
  infixToPostfix: "Infix → Postfix",
  postfixEval: "Postfix Evaluation",
  recursionStack: "Recursion Stack",
};

const APP_TEXT_PLACEHOLDER: Partial<Record<StackOperationId, string>> = {
  balancedParens: "{[()()]}",
  infixToPostfix: "a+b*(c-d)/e",
  postfixEval: "5 3 + 8 2 - *",
};

export function StackSidebar() {
  const router = useRouter();
  const operation = useStackStore((s) => s.operation);
  const values = useStackStore((s) => s.values);
  const params = useStackStore((s) => s.params);
  const setValues = useStackStore((s) => s.setValues);
  const setParams = useStackStore((s) => s.setParams);
  const randomize = useStackStore((s) => s.randomize);
  const run = useStackStore((s) => s.run);

  const isList = operation === "llPush" || operation === "llPop" || operation === "llPeek";
  const isApp = !!APP_LABEL[operation];
  const isRecursion = operation === "recursionStack";
  const usesText = operation === "balancedParens" || operation === "infixToPostfix" || operation === "postfixEval";
  const meta = STACK_OPERATIONS.find((o) => o.id === operation);
  const tabs = isList ? LIST_TABS : ARRAY_TABS;

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
    if (!isApp) commit(text);
    run(operation, params);
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="stacked_bar_chart" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">
            {isApp ? APP_LABEL[operation] : isList ? "Stack · Linked List" : "Stack · Array"}
          </h2>
        </div>

        {/* Initial contents (bottom → top) — hidden for the expression apps */}
        {!isApp && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">STACK (BOTTOM → TOP)</label>
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
                onClick={() => randomize(3)}
                title="Randomize"
                className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="shuffle" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* Quick op tabs (implementation pages only) */}
        {!isApp && (
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">OPERATIONS</label>
            <div className="grid grid-cols-2 gap-1">
              {tabs.map((t) => {
                const selected = t.id === operation;
                return (
                  <button
                    key={t.id}
                    onClick={() => router.push(`/topics/stacks/${t.subpath}`)}
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
        )}

        {/* Expression input (applications) */}
        {usesText && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {operation === "postfixEval" ? "POSTFIX EXPRESSION (SPACE-SEPARATED)" : "EXPRESSION"}
            </label>
            <input
              value={params.text}
              onChange={(e) => setParams({ text: e.target.value })}
              spellCheck={false}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder={APP_TEXT_PLACEHOLDER[operation]}
            />
          </div>
        )}

        {/* Numeric params */}
        <div className="flex gap-2">
          {meta?.params.includes("value") && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
                {isRecursion ? "N (FACTORIAL)" : "VALUE"}
              </label>
              <input
                type="number"
                value={params.value}
                onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          )}
          {!isApp && !isList && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">CAPACITY</label>
              <input
                type="number"
                min={3}
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
