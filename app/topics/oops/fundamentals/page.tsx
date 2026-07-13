import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "fundamentals")!;
  return (
    <TopicHub
      path="/topics/oops/fundamentals"
      icon={cat.icon}
      eyebrow="OOP · FUNDAMENTALS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a concept"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/fundamentals/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
