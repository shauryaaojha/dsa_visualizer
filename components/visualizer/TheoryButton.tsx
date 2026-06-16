"use client";

// Floating "Theory" button pinned to the top-left of every visualizer canvas.
// Clicking it opens a modal explaining the concept behind the current page,
// sourced from data/theory.ts. Renders nothing when a page has no theory doc.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import type { TheoryDoc } from "@/data/theory";

export function TheoryButton({ doc }: { doc?: TheoryDoc }) {
  const [open, setOpen] = useState(false);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!doc) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Read the theory behind this visualization"
        className="absolute left-3 top-[4.75rem] z-20 flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container/85 px-3 py-1.5 font-label-caps text-[11px] text-on-surface-variant backdrop-blur-md transition-colors hover:border-primary hover:text-primary"
      >
        <Icon name="menu_book" className="text-[16px]" />
        Theory
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <button
              aria-label="Close theory"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="scroll-thin relative max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-low shadow-2xl"
            >
              <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low/95 px-lg py-4 backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon name="menu_book" className="text-[18px] text-primary" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">{doc.title}</h2>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant/80">{doc.summary}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>

              <div className="flex flex-col gap-lg px-lg py-5">
                {/* Complexity + LeetCode badges */}
                {(doc.complexity || doc.leetcode) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {doc.complexity && (
                      <>
                        <span className="rounded border border-outline-variant px-2 py-0.5 font-mono text-[11px] text-on-surface-variant">
                          Time {doc.complexity.time}
                        </span>
                        <span className="rounded border border-outline-variant px-2 py-0.5 font-mono text-[11px] text-on-surface-variant">
                          Space {doc.complexity.space}
                        </span>
                      </>
                    )}
                    {doc.leetcode && (
                      <span className="rounded border border-amber/50 bg-amber/10 px-2 py-0.5 font-label-caps text-[10px] text-amber">
                        LeetCode · {doc.leetcode}
                      </span>
                    )}
                  </div>
                )}

                {doc.sections.map((sec) => (
                  <section key={sec.heading}>
                    <h3 className="mb-1 font-label-caps text-[11px] uppercase tracking-wider text-primary">{sec.heading}</h3>
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{sec.body}</p>
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
