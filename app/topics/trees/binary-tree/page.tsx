import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("trees", "binary-tree")!;
  return (
    <TopicHub
      path="/topics/trees/binary-tree"
      icon={cat.icon}
      eyebrow="TREES · BINARY TREE"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/trees/binary-tree/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
