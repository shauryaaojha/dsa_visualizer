import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("queues", "circular-queue")!;
  return (
    <TopicHub
      path="/topics/queues/circular-queue"
      icon={cat.icon}
      eyebrow="QUEUES · CIRCULAR"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/queues/circular-queue/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
