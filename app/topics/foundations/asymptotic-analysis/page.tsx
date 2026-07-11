import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("foundations", "asymptotic-analysis")!;
  return (
    <TopicHub
      path="/topics/foundations/asymptotic-analysis"
      icon={cat.icon}
      eyebrow="FOUNDATIONS · ASYMPTOTIC"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a lesson"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/foundations/asymptotic-analysis/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
