import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";
import { getJourneyStage } from "@/data/journey";

export default function ArraysHub() {
  const section = getSection("arrays")!;
  const cards = section.categories.map((c) => ({
    title: c.title,
    blurb: c.blurb,
    icon: c.icon,
    href: `/topics/arrays/${c.slug}`,
    status: c.status,
  }));

  return (
    <TopicHub
      path="/topics/arrays"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      story={getJourneyStage("arrays")}
      cards={cards}
      cardsHeading="Choose a category"
    />
  );
}
