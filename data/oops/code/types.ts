import type { OopsLanguage } from "@/types/visualization";

export interface OopsCodeSample {
  /** Real, idiomatic source (~15–35 lines). */
  code: string;
  /** anchor -> 1-based line numbers IN THIS sample. */
  lines: Record<string, number[]>;
}

export interface OopsCodeEntry {
  key: string; // === OopsProgram.codeKey
  title: string;
  samples: Record<OopsLanguage, OopsCodeSample>;
}
