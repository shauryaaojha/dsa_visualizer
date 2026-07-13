import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "four-pillars")!;
  return (
    <TopicHub
      path="/topics/oops/four-pillars"
      icon={cat.icon}
      eyebrow="OOP · FOUR PILLARS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a pillar"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/four-pillars/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
