import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("trees", "binary-search-tree")!;
  return (
    <TopicHub
      path="/topics/trees/binary-search-tree"
      icon={cat.icon}
      eyebrow="TREES · BST"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/trees/binary-search-tree/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
