import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "solid-principles")!;
  return (
    <TopicHub
      path="/topics/oops/solid-principles"
      icon={cat.icon}
      eyebrow="OOP · SOLID"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a principle"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/solid-principles/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
