import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("graphs", "traversal")!;
  return (
    <TopicHub
      path="/topics/graphs/traversal"
      icon={cat.icon}
      eyebrow="GRAPHS · TRAVERSAL"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/graphs/traversal/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
