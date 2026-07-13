// Registry of real Java/C++/Python source samples for every OOP page. Keyed by
// OopsProgram.codeKey; the notes rail resolves step.anchor -> line numbers in
// the active language's sample. Split by category to keep files reviewable.

import { ADVANCED_CODE } from "./advanced";
import { FUNDAMENTALS_CODE } from "./fundamentals";
import { PATTERNS_CODE } from "./patterns";
import { PILLARS_CODE } from "./pillars";
import { SOLID_CODE } from "./solid";
import type { OopsCodeEntry } from "./types";

const ALL: OopsCodeEntry[] = [...FUNDAMENTALS_CODE, ...PILLARS_CODE, ...ADVANCED_CODE, ...PATTERNS_CODE, ...SOLID_CODE];

export const OOPS_CODE: Record<string, OopsCodeEntry> = Object.fromEntries(
  ALL.map((e) => [e.key, e]),
);

export type { OopsCodeEntry, OopsCodeSample } from "./types";
