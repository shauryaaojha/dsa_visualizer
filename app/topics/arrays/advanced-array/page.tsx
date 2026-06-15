import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("arrays", "advanced-array")!;
  return (
    <TopicHub
      path="/topics/arrays/advanced-array"
      icon={cat.icon}
      eyebrow="ARRAYS · CATEGORY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a technique"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/arrays/advanced-array/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
