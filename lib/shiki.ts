// Memoized fine-grained Shiki highlighter. Uses the JavaScript regex engine
// (no Oniguruma wasm) and only the three OOP languages + one theme, so the
// client bundle stays small. Call getShiki() from a client component's
// useEffect; the promise is shared across all CodePanel instances.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import langCpp from "shiki/langs/cpp.mjs";
import langJava from "shiki/langs/java.mjs";
import langPython from "shiki/langs/python.mjs";
import themeVesper from "shiki/themes/vesper.mjs";

export const SHIKI_THEME = "vesper";

let promise: Promise<HighlighterCore> | null = null;

export function getShiki(): Promise<HighlighterCore> {
  promise ??= createHighlighterCore({
    themes: [themeVesper],
    langs: [langJava, langCpp, langPython],
    engine: createJavaScriptRegexEngine(),
  });
  return promise;
}
