"use client";

// "Why these structures?" — the evolution timeline. Each stage answers the
// faculty question students never hear: what PROBLEM forced this structure
// to exist, what IDEA fixes it, and which trade-off births the next one.

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { JOURNEY } from "@/data/journey";

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

export function EvolutionStory() {
  return (
    <section id="why" className="mx-auto w-full max-w-4xl scroll-mt-6 px-margin py-16">
      <motion.h2 {...fadeUp} className="mb-2 text-center font-label-caps text-label-caps text-primary/80">
        THE STORY — WHY EACH STRUCTURE EXISTS
      </motion.h2>
      <motion.p {...fadeUp} className="mx-auto mb-3 max-w-2xl text-center font-headline-md text-headline-md text-on-surface">
        Nobody invented six data structures for fun.
      </motion.p>
      <motion.p {...fadeUp} className="mx-auto mb-12 max-w-xl text-center font-body-sm text-body-sm leading-relaxed text-on-surface-variant/75">
        Each one was born because the previous one hit a wall. Read the chain once and
        you&apos;ll never have to memorize &ldquo;when to use what&rdquo; again — the trade-offs decide for you.
      </motion.p>

      <div className="relative">
        {/* spine */}
        <div className="absolute bottom-6 left-[23px] top-6 w-px bg-gradient-to-b from-coral/60 via-amber/50 to-amber/20 sm:left-[27px]" />

        <div className="flex flex-col gap-8">
          {JOURNEY.map((st, i) => (
            <motion.div
              key={st.slug}
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="relative flex items-start gap-4 sm:gap-6"
            >
              {/* node */}
              <div className="relative z-10 mt-1 flex flex-col items-center">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl border bg-surface-container-low sm:h-14 sm:w-14"
                  style={{ borderColor: `${st.accent}88`, color: st.accent, boxShadow: `0 0 24px ${st.accent}33` }}
                >
                  <Icon name={st.icon} className="text-[22px] sm:text-[26px]" />
                </span>
                <span className="mt-1.5 font-mono text-[10px] text-on-surface-variant/50">{String(i + 1).padStart(2, "0")}</span>
              </div>

              {/* card */}
              <Link href={`/topics/${st.slug}`} className="group block flex-1">
                <div
                  className="glass-panel rounded-lg p-5 transition-all duration-200 group-hover:-translate-y-0.5"
                  style={{ borderColor: undefined }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{st.title}</h3>
                    <span
                      className="flex items-center gap-1 font-label-caps text-[10px] tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: st.accent }}
                    >
                      VISUALIZE <Icon name="arrow_forward" className="text-[13px]" />
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant/85">
                      <span className="mr-2 rounded-sm border border-error/50 bg-error/10 px-1.5 py-px font-label-caps text-[9px] tracking-wider text-error">
                        THE WALL
                      </span>
                      {st.problem}
                    </p>
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant/85">
                      <span className="mr-2 rounded-sm border border-mint/50 bg-mint/10 px-1.5 py-px font-label-caps text-[9px] tracking-wider text-mint">
                        THE IDEA
                      </span>
                      {st.idea}
                    </p>
                    <p className="font-body-sm text-[12px] italic leading-relaxed text-on-surface-variant/55">
                      {st.realWorld}
                    </p>
                  </div>
                </div>

                {/* trade-off → next stage connector */}
                {i < JOURNEY.length - 1 && (
                  <div className="ml-1 mt-3 flex items-start gap-2">
                    <Icon name="south" className="mt-px shrink-0 text-[14px] text-amber/70" />
                    <p className="font-body-sm text-[12px] leading-relaxed text-amber/80">
                      <span className="font-label-caps text-[9px] tracking-wider">BUT… </span>
                      {st.tradeoff}
                    </p>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p {...fadeUp} className="mx-auto mt-12 max-w-xl text-center font-body-sm text-body-sm text-on-surface-variant/70">
        Six walls, six ideas — and every &ldquo;which structure should I use?&rdquo; interview question
        is just asking which trade-off you can afford.
      </motion.p>
    </section>
  );
}
