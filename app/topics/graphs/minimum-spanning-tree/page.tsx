import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("graphs", "minimum-spanning-tree")!;
  return (
    <TopicHub
      path="/topics/graphs/minimum-spanning-tree"
      icon={cat.icon}
      eyebrow="GRAPHS · MST"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/graphs/minimum-spanning-tree/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
