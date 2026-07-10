import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("trees", "binary-tree")!;
  const group = cat.leaves.find((l) => l.slug === "traversal")!;
  return (
    <TopicHub
      path="/topics/trees/binary-tree/traversal"
      icon={group.icon}
      eyebrow="BINARY TREE · TRAVERSAL"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose a variant"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/trees/binary-tree/traversal/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
