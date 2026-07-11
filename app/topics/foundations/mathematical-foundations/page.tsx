import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("foundations", "mathematical-foundations")!;
  return (
    <TopicHub
      path="/topics/foundations/mathematical-foundations"
      icon={cat.icon}
      eyebrow="FOUNDATIONS · MATH"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a lesson"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/foundations/mathematical-foundations/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
