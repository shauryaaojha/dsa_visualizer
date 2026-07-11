"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { STRING_OPERATIONS, useStringStore } from "@/lib/stringStore";
import type { StringOperationId } from "@/types/visualization";

const TABS: { id: StringOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "strReverse", label: "Reverse", icon: "swap_horiz", subpath: "classic-problems/reverse-string" },
  { id: "strPalindrome", label: "Palindrome", icon: "compare_arrows", subpath: "classic-problems/valid-palindrome" },
  { id: "strAnagram", label: "Anagram", icon: "shuffle", subpath: "classic-problems/valid-anagram" },
  { id: "strFirstUnique", label: "First Unique", icon: "looks_one", subpath: "classic-problems/first-unique-character" },
  { id: "strCommonPrefix", label: "Prefix", icon: "align_horizontal_left", subpath: "classic-problems/longest-common-prefix" },
];

const TEXT_PLACEHOLDER: Partial<Record<StringOperationId, string>> = {
  strReverse: "visualize",
  strPalindrome: "racecar",
  strAnagram: "listen",
  strFirstUnique: "leetcode",
  strCommonPrefix: "flower, flow, flight",
};

export function StringSidebar() {
  const router = useRouter();
  const operation = useStringStore((s) => s.operation);
  const params = useStringStore((s) => s.params);
  const setParams = useStringStore((s) => s.setParams);
  const run = useStringStore((s) => s.run);

  const meta = STRING_OPERATIONS.find((o) => o.id === operation);

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="title" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">Strings · LeetCode</h2>
        </div>

        {/* Problem tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">PROBLEMS</label>
          <div className="grid grid-cols-2 gap-1">
            {TABS.map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/strings/${t.subpath}`)}
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

        {/* Inputs */}
        {meta?.params.includes("text") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {operation === "strCommonPrefix" ? "WORDS (COMMA-SEPARATED)" : "STRING s"}
            </label>
            <input
              value={params.text}
              onChange={(e) => setParams({ text: e.target.value })}
              spellCheck={false}
              placeholder={TEXT_PLACEHOLDER[operation]}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        )}
        {meta?.params.includes("text2") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">STRING t</label>
            <input
              value={params.text2}
              onChange={(e) => setParams({ text2: e.target.value })}
              spellCheck={false}
              placeholder="silent"
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        )}

        {meta && <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>}

        <button
          onClick={() => run(operation, params)}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Re-run
        </button>
      </div>
    </aside>
  );
}
