import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("foundations", "complexity-analysis")!;
  return (
    <TopicHub
      path="/topics/foundations/complexity-analysis"
      icon={cat.icon}
      eyebrow="FOUNDATIONS · ANALYSIS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a lesson"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/foundations/complexity-analysis/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
