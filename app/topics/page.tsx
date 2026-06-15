import { TopicHub } from "@/components/topic/TopicHub";
import { SECTIONS } from "@/data/curriculum";

export default function TopicsIndex() {
  return (
    <TopicHub
      path="/topics"
      icon="category"
      eyebrow="ALL TOPICS"
      title="Topics"
      blurb="The full curriculum. Arrays is available now — the rest are on the way."
      cardsHeading="Sections"
      cards={SECTIONS.map((s) => ({
        title: s.title,
        blurb: s.blurb,
        icon: s.icon,
        href: `/topics/${s.slug}`,
        status: s.status,
      }))}
    />
  );
}
