import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";
import { getJourneyStage } from "@/data/journey";

export default function Hub() {
  const section = getSection("hashing")!;
  return (
    <TopicHub
      path="/topics/hashing"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      story={getJourneyStage("hashing")}
      cardsHeading="Choose a category"
      cards={section.categories.map((c) => ({
        title: c.title,
        blurb: c.blurb,
        icon: c.icon,
        href: `/topics/hashing/${c.slug}`,
        status: c.status,
      }))}
    />
  );
}
