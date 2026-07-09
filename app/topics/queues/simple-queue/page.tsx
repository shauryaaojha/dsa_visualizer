import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("queues", "simple-queue")!;
  return (
    <TopicHub
      path="/topics/queues/simple-queue"
      icon={cat.icon}
      eyebrow="QUEUES · SIMPLE"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/queues/simple-queue/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
