import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";

export default function Hub() {
  const section = getSection("linked-list")!;
  return (
    <TopicHub
      path="/topics/linked-list"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      cardsHeading="Choose a category"
      cards={section.categories.map((c) => ({
        title: c.title,
        blurb: c.blurb,
        icon: c.icon,
        href: `/topics/linked-list/${c.slug}`,
        status: c.status,
      }))}
    />
  );
}
