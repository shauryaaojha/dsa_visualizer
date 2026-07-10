import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("trees", "trie")!;
  return (
    <TopicHub
      path="/topics/trees/trie"
      icon={cat.icon}
      eyebrow="TREES · TRIE"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/trees/trie/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
