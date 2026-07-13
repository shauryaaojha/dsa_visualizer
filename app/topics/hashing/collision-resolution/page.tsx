import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("hashing", "collision-resolution")!;
  return (
    <TopicHub
      path="/topics/hashing/collision-resolution"
      icon={cat.icon}
      eyebrow="HASHING · COLLISION RESOLUTION"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a strategy"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/hashing/collision-resolution/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
