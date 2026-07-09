import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("stacks", "linked-list-implementation")!;
  return (
    <TopicHub
      path="/topics/stacks/linked-list-implementation"
      icon={cat.icon}
      eyebrow="STACKS · LINKED LIST"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/stacks/linked-list-implementation/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
