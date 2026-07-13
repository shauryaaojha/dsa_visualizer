import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";
import { getJourneyStage } from "@/data/journey";

export default function Hub() {
  const section = getSection("oops")!;
  return (
    <TopicHub
      path="/topics/oops"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      story={getJourneyStage("oops")}
      cardsHeading="Choose a category"
      cards={section.categories.map((c) => ({
        title: c.title,
        blurb: c.blurb,
        icon: c.icon,
        href: `/topics/oops/${c.slug}`,
        status: c.status,
      }))}
    />
  );
}
