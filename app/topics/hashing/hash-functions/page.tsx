import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("hashing", "hash-functions")!;
  return (
    <TopicHub
      path="/topics/hashing/hash-functions"
      icon={cat.icon}
      eyebrow="HASHING · HASH FUNCTIONS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a method"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/hashing/hash-functions/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
