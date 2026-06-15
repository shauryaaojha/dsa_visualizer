import { TopicHub } from "@/components/topic/TopicHub";
import { SECTIONS } from "@/data/curriculum";

export default function Landing() {
  const cards = SECTIONS.map((s) => ({
    title: s.title,
    blurb: s.blurb,
    icon: s.icon,
    href: `/topics/${s.slug}`,
    status: s.status,
  }));

  return (
    <TopicHub
      icon="deployed_code"
      eyebrow="DS_VISUALIZER · EMBER & CORAL EDITION"
      title="Data Structures, Animated"
      blurb="Pick a topic to drill into. Every operation is broken into narrated, step-by-step animations with live pseudocode and complexity — built for learning and teaching."
      cards={cards}
      cardsHeading="Choose a topic"
    />
  );
}
