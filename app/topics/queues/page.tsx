import { TopicHub } from "@/components/topic/TopicHub";
import { getSection } from "@/data/curriculum";

export default function Hub() {
  const section = getSection("queues")!;
  return (
    <TopicHub
      path="/topics/queues"
      icon={section.icon}
      eyebrow="TOPIC"
      title={section.title}
      blurb={section.blurb}
      cardsHeading="Choose a category"
      cards={section.categories.map((c) => ({
        title: c.title,
        blurb: c.blurb,
        icon: c.icon,
        href: `/topics/queues/${c.slug}`,
        status: c.status,
      }))}
    />
  );
}
