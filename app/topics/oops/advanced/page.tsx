import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "advanced")!;
  return (
    <TopicHub
      path="/topics/oops/advanced"
      icon={cat.icon}
      eyebrow="OOP · ADVANCED"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a concept"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/advanced/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
