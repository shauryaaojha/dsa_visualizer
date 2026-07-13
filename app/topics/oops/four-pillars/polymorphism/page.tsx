import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "four-pillars")!;
  const group = cat.leaves.find((l) => l.slug === "polymorphism")!;
  return (
    <TopicHub
      path="/topics/oops/four-pillars/polymorphism"
      icon={group.icon}
      eyebrow="FOUR PILLARS · POLYMORPHISM"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose a kind"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/four-pillars/polymorphism/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
