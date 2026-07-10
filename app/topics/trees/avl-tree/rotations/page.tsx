import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("trees", "avl-tree")!;
  const group = cat.leaves.find((l) => l.slug === "rotations")!;
  return (
    <TopicHub
      path="/topics/trees/avl-tree/rotations"
      icon={group.icon}
      eyebrow="AVL TREE · ROTATIONS"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose a case"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/trees/avl-tree/rotations/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
