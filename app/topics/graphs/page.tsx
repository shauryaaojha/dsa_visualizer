import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";
import { getJourneyStage } from "@/data/journey";

export default function Hub() {
  const section = getSection("graphs")!;
  return (
    <TopicHub
      path="/topics/graphs"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      story={getJourneyStage("graphs")}
      cardsHeading="Choose a category"
      cards={section.categories.map((c) => ({
        title: c.title,
        blurb: c.blurb,
        icon: c.icon,
        href: `/topics/graphs/${c.slug}`,
        status: c.status,
      }))}
    />
  );
}
