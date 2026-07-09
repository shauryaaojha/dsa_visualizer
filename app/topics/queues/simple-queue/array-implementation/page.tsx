import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("queues", "simple-queue")!;
  const group = cat.leaves.find((l) => l.slug === "array-implementation")!;
  return (
    <TopicHub
      path="/topics/queues/simple-queue/array-implementation"
      icon={group.icon}
      eyebrow="SIMPLE QUEUE · ARRAY"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose an operation"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/queues/simple-queue/array-implementation/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
