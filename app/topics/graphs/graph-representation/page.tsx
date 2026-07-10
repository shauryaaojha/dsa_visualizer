import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("graphs", "graph-representation")!;
  return (
    <TopicHub
      path="/topics/graphs/graph-representation"
      icon={cat.icon}
      eyebrow="GRAPHS · REPRESENTATION"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/graphs/graph-representation/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
