import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("hashing", "hash-table")!;
  return (
    <TopicHub
      path="/topics/hashing/hash-table"
      icon={cat.icon}
      eyebrow="HASHING · HASH TABLE"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/hashing/hash-table/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
