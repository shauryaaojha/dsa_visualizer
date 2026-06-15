import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("linked-list", "doubly-linked-list")!;
  return (
    <TopicHub
      path="/topics/linked-list/doubly-linked-list"
      icon={cat.icon}
      eyebrow="DOUBLY LINKED LIST"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/linked-list/doubly-linked-list/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
