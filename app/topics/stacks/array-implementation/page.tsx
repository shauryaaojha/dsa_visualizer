import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("stacks", "array-implementation")!;
  return (
    <TopicHub
      path="/topics/stacks/array-implementation"
      icon={cat.icon}
      eyebrow="STACKS · ARRAY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/stacks/array-implementation/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
