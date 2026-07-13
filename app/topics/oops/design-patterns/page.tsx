import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "design-patterns")!;
  return (
    <TopicHub
      path="/topics/oops/design-patterns"
      icon={cat.icon}
      eyebrow="OOP · PATTERNS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a pattern"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/design-patterns/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
