import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("foundations", "time-complexity")!;
  return (
    <TopicHub
      path="/topics/foundations/time-complexity"
      icon={cat.icon}
      eyebrow="FOUNDATIONS · COMPLEXITY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a lesson"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/foundations/time-complexity/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
