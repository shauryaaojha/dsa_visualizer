import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("foundations", "programming-basics")!;
  return (
    <TopicHub
      path="/topics/foundations/programming-basics"
      icon={cat.icon}
      eyebrow="FOUNDATIONS · BASICS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a lesson"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/foundations/programming-basics/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
