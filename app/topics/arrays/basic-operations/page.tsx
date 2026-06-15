import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("arrays", "basic-operations")!;
  return (
    <TopicHub
      path="/topics/arrays/basic-operations"
      icon={cat.icon}
      eyebrow="ARRAYS · CATEGORY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/arrays/basic-operations/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
