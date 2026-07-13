"use client";

// Multi-language source viewer for the OOP pages. Tokenizes the active sample
// ONCE per (concept, language) with Shiki, caches the themed tokens, and
// renders its own line divs so per-step highlighting is just a className
// toggle (bg-amber/15, matching NotesPanel's pseudocode) — no re-tokenizing
// during playback. Falls back to plain monospace while Shiki loads async.

import { useEffect, useRef, useState } from "react";
import { getShiki, SHIKI_THEME } from "@/lib/shiki";
import type { OopsLanguage } from "@/types/visualization";
import type { OopsCodeEntry } from "@/data/oops/code";

// Structural shape of a Shiki themed token — avoids depending on the exact
// exported type name across Shiki versions.
interface Token {
  content: string;
  color?: string;
  fontStyle?: number;
}

const LANGS: { id: OopsLanguage; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "python", label: "Python" },
];

interface Tokenized {
  key: string; // `${entryKey}:${lang}`
  lines: Token[][];
  bg: string;
  fg: string;
}

interface CodePanelProps {
  entry: OopsCodeEntry;
  language: OopsLanguage;
  onLanguageChange: (lang: OopsLanguage) => void;
  activeLines: number[];
}

function fontStyleClass(fontStyle?: number): string {
  if (!fontStyle) return "";
  let cls = "";
  if (fontStyle & 1) cls += " italic";
  if (fontStyle & 2) cls += " font-bold";
  if (fontStyle & 4) cls += " underline";
  return cls;
}

export function CodePanel({ entry, language, onLanguageChange, activeLines }: CodePanelProps) {
  const sample = entry.samples[language];
  const [tok, setTok] = useState<Tokenized | null>(null);
  const wantKey = `${entry.key}:${language}`;
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ok = true;
    getShiki().then((h) => {
      if (!ok) return;
      const res = h.codeToTokens(sample.code, { lang: language, theme: SHIKI_THEME });
      setTok({ key: wantKey, lines: res.tokens, bg: res.bg ?? "#101010", fg: res.fg ?? "#e8e8e8" });
    });
    return () => {
      ok = false;
    };
  }, [wantKey, sample.code, language]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLines]);

  const ready = tok?.key === wantKey;
  const lineCount = ready ? tok!.lines.length : sample.code.split("\n").length;
  const gutterW = String(lineCount).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Language tabs */}
      <div className="flex shrink-0 gap-1 px-md pb-1.5">
        {LANGS.map((l) => {
          const selected = l.id === language;
          return (
            <button
              key={l.id}
              onClick={() => onLanguageChange(l.id)}
              className={`border px-2.5 py-1 font-label-caps text-[10px] tracking-wider transition-colors ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-auto px-md pb-md">
        <pre
          className="overflow-x-auto rounded p-2 font-code-snippet text-code-snippet leading-relaxed"
          style={{ background: ready ? tok!.bg : "#101010", color: ready ? tok!.fg : "#c9c9c9" }}
        >
          {ready
            ? tok!.lines.map((line, i) => {
                const lit = activeLines.includes(i + 1);
                return (
                  <div
                    key={i}
                    ref={lit ? activeRef : undefined}
                    className={`-mx-2 flex px-2 ${lit ? "bg-amber/20" : ""}`}
                    style={lit ? { boxShadow: "inset 2px 0 0 #F5A623" } : undefined}
                  >
                    <span
                      className="mr-3 inline-block shrink-0 select-none text-right opacity-30"
                      style={{ width: `${gutterW}ch` }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                      {line.length === 0 ? " " : line.map((t, j) => (
                        <span key={j} className={fontStyleClass(t.fontStyle)} style={{ color: t.color }}>
                          {t.content}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })
            : sample.code.split("\n").map((line, i) => (
                <div key={i} className="-mx-2 flex px-2">
                  <span
                    className="mr-3 inline-block shrink-0 select-none text-right opacity-30"
                    style={{ width: `${gutterW}ch` }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">{line || " "}</span>
                </div>
              ))}
        </pre>
      </div>
    </div>
  );
}
