import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("arrays", "searching")!;
  return (
    <TopicHub
      path="/topics/arrays/searching"
      icon={cat.icon}
      eyebrow="ARRAYS · CATEGORY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/arrays/searching/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
