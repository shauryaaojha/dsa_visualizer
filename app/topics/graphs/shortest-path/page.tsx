import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("graphs", "shortest-path")!;
  return (
    <TopicHub
      path="/topics/graphs/shortest-path"
      icon={cat.icon}
      eyebrow="GRAPHS · SHORTEST PATH"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/graphs/shortest-path/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
