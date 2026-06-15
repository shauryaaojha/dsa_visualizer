import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("arrays", "sorting")!;
  return (
    <TopicHub
      path="/topics/arrays/sorting"
      icon={cat.icon}
      eyebrow="ARRAYS · CATEGORY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/arrays/sorting/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
