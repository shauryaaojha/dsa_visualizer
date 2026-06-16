import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("arrays", "patterns")!;
  return (
    <TopicHub
      path="/topics/arrays/patterns"
      icon={cat.icon}
      eyebrow="ARRAYS · CATEGORY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a problem"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/arrays/patterns/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
