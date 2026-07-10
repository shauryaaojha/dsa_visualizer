"use client";

// The landing page: hero with a live auto-playing demo, stats strip, feature
// row, the topic grid, and a footer. Everything animates in on scroll.

import { motion } from "framer-motion";
import Link from "next/link";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { Navbar } from "@/components/layout/Navbar";
import { ShaderBackground } from "@/components/layout/ShaderBackground";
import { Icon } from "@/components/ui/Icon";
import { SECTIONS, type LeafMeta, type SectionMeta } from "@/data/curriculum";

// --- Derived stats -----------------------------------------------------------

const leafCount = (leaves: LeafMeta[]): number =>
  leaves.reduce((sum, l) => sum + (l.children ? l.children.length : 1), 0);

const sectionLeafCount = (s: SectionMeta): number =>
  s.categories.reduce((sum, c) => sum + leafCount(c.leaves), 0);

const liveSections = SECTIONS.filter((s) => s.status === "available");
const totalVisualizations = liveSections.reduce((sum, s) => sum + sectionLeafCount(s), 0);

// Accent rotation for the topic cards (matches the shader orbs).
const ACCENTS = [
  { c: "#FF5F4A", name: "coral" },
  { c: "#F5A623", name: "amber" },
  { c: "#34C98A", name: "mint" },
  { c: "#9ccaff", name: "sky" },
];

// --- Motion presets ------------------------------------------------------------

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

// --- Sections --------------------------------------------------------------------

const FEATURES = [
  {
    icon: "animation",
    title: "One change per frame",
    body: "Every operation is compiled into narrated frames — a single pointer write, one comparison, one swap. Nothing happens off-screen.",
  },
  {
    icon: "code",
    title: "Pseudocode, highlighted live",
    body: "The exact line being executed lights up as the structure changes, so the code and the picture stay glued together.",
  },
  {
    icon: "memory",
    title: "Memory made visible",
    body: "HEAD / TOP / FRONT boxes hold real (fake) addresses that get overwritten before your eyes. Links visibly break and re-form.",
  },
  {
    icon: "play_circle",
    title: "Play, scrub, replay",
    body: "Pause anywhere, step backwards, change speed, re-run with your own data. Understanding beats watching.",
  },
];

export function LandingPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <ShaderBackground />
      <Navbar />

      <div className="scroll-thin mt-16 flex-1 overflow-y-auto scroll-smooth">
        {/* ============ HERO ============ */}
        <section className="mx-auto w-full max-w-6xl px-margin pb-16 pt-14 lg:pt-20">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-10">
            <div className="max-w-xl lg:pt-6">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 flex flex-wrap items-center gap-2 font-label-caps text-label-caps text-on-surface-variant"
              >
                <span className="rounded-full border border-coral/40 bg-coral/10 px-3 py-1 text-coral">STEP-BY-STEP</span>
                <span className="rounded-full border border-amber/40 bg-amber/10 px-3 py-1 text-amber">NARRATED</span>
                <span className="rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-mint">INTERACTIVE</span>
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="font-headline-xl text-[44px] font-bold leading-[1.08] tracking-tight text-on-surface sm:text-[56px]"
              >
                Data structures,
                <br />
                <span className="bg-gradient-to-r from-coral via-primary to-amber bg-clip-text text-transparent">
                  finally visible.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="mt-5 font-body-md text-[15px] leading-relaxed text-on-surface-variant/85"
              >
                Watch pointers rewire, stacks overflow, rings wrap and trees rotate — one
                narrated step at a time, with the pseudocode line that caused it lit up
                beside the picture. Built for learning it once, properly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/topics/arrays"
                  className="group flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-caps text-label-caps text-surface transition-all hover:shadow-[0_8px_30px_rgba(255,107,0,0.35)] active:scale-[0.97]"
                >
                  <Icon name="play_arrow" className="text-[18px]" />
                  START LEARNING
                </Link>
                <a
                  href="#topics"
                  className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container/60 px-6 py-3 font-label-caps text-label-caps text-on-surface-variant backdrop-blur-sm transition-colors hover:border-primary/60 hover:text-primary"
                >
                  <Icon name="grid_view" className="text-[16px]" />
                  BROWSE TOPICS
                </a>
              </motion.div>

              {/* Stats */}
              <motion.dl
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.34 }}
                className="mt-10 grid grid-cols-3 gap-4 border-t border-outline-variant/60 pt-6"
              >
                {[
                  [String(liveSections.length), "topics live"],
                  [`${totalVisualizations}+`, "visualizations"],
                  ["every O(·)", "explained"],
                ].map(([v, k]) => (
                  <div key={k}>
                    <dt className="font-mono text-[22px] font-bold text-primary">{v}</dt>
                    <dd className="mt-0.5 font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
                      {k.toUpperCase()}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            {/* Live demo */}
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full max-w-[560px] flex-1"
            >
              <HeroDemo />
              <p className="mt-3 text-center font-mono text-[10px] text-on-surface-variant/40">
                ↑ an actual lesson, playing itself
              </p>
            </motion.div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className="border-y border-outline-variant/50 bg-surface-container-lowest/40 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl px-margin py-14">
            <motion.h2 {...fadeUp} className="mb-2 text-center font-label-caps text-label-caps text-primary/80">
              WHY IT STICKS
            </motion.h2>
            <motion.p {...fadeUp} className="mx-auto mb-10 max-w-xl text-center font-headline-md text-headline-md text-on-surface">
              Not a slideshow. A machine you can watch think.
            </motion.p>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className="glass-panel rounded-lg p-5"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                    <Icon name={f.icon} className="text-[20px]" />
                  </span>
                  <h3 className="mb-1.5 font-headline-sm text-[15px] font-semibold text-on-surface">{f.title}</h3>
                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant/75">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TOPICS ============ */}
        <section id="topics" className="mx-auto w-full max-w-6xl scroll-mt-6 px-margin py-16">
          <motion.h2 {...fadeUp} className="mb-2 font-label-caps text-label-caps text-primary/80">
            THE CURRICULUM
          </motion.h2>
          <motion.p {...fadeUp} className="mb-10 max-w-2xl font-headline-md text-headline-md text-on-surface">
            From arrays to strongly connected components — in order, or wherever it hurts.
          </motion.p>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const disabled = s.status === "soon";
              const count = sectionLeafCount(s);
              const card = (
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                  className={`group glass-panel relative flex h-full flex-col rounded-lg p-md transition-all duration-200 ${
                    disabled ? "opacity-45" : "hover:-translate-y-1"
                  }`}
                  whileHover={disabled ? undefined : { boxShadow: `0 8px 30px ${accent.c}22`, borderColor: `${accent.c}99` }}
                >
                  <div className="mb-md flex items-start justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-lg border"
                      style={{ borderColor: `${accent.c}66`, backgroundColor: `${accent.c}1a`, color: accent.c }}
                    >
                      <Icon name={s.icon} className="text-[22px]" />
                    </span>
                    {disabled ? (
                      <span className="rounded-sm border border-outline-variant bg-surface-container-high px-2 py-0.5 font-label-caps text-[9px] text-on-surface-variant">
                        SOON
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-on-surface-variant/50">
                        {count} visualizations
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 font-headline-sm text-headline-sm text-on-surface">{s.title}</h3>
                  <p className="flex-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant/80">{s.blurb}</p>
                  {!disabled && (
                    <div className="mt-md flex items-center gap-1 font-label-caps text-[10px] tracking-wider" style={{ color: accent.c }}>
                      EXPLORE
                      <Icon name="arrow_forward" className="text-[13px] transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </motion.div>
              );
              return disabled ? (
                <div key={s.slug} className="cursor-not-allowed" title="Coming soon">
                  {card}
                </div>
              ) : (
                <Link key={s.slug} href={`/topics/${s.slug}`} className="block h-full">
                  {card}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ============ CLOSER ============ */}
        <section className="border-t border-outline-variant/50">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-margin py-16 text-center">
            <motion.h2 {...fadeUp} className="max-w-2xl font-headline-lg text-headline-lg text-on-surface">
              Stop memorizing.{" "}
              <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">Start watching.</span>
            </motion.h2>
            <motion.p {...fadeUp} className="mt-3 max-w-lg font-body-md text-body-md text-on-surface-variant/80">
              Every structure, every operation, every edge case — animated slow enough to
              actually follow, and replayable until it clicks.
            </motion.p>
            <motion.div {...fadeUp} className="mt-8">
              <Link
                href="/topics/arrays"
                className="flex items-center gap-2 rounded-lg bg-primary-container px-8 py-3.5 font-label-caps text-label-caps text-surface transition-all hover:shadow-[0_8px_30px_rgba(255,107,0,0.35)] active:scale-[0.97]"
              >
                <Icon name="rocket_launch" className="text-[18px]" />
                DIVE IN
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-outline-variant/50 bg-surface-container-lowest/60 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-margin py-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="font-headline-md text-[18px] font-bold text-primary">&lt;DS/&gt;</span>
              <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
                DS_VISUALIZER · BUILT FOR LEARNING & TEACHING
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {liveSections.map((s) => (
                <Link
                  key={s.slug}
                  href={`/topics/${s.slug}`}
                  className="font-label-caps text-[10px] tracking-wider text-on-surface-variant/60 transition-colors hover:text-primary"
                >
                  {s.title.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
