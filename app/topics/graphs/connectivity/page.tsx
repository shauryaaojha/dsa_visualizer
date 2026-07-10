import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("graphs", "connectivity")!;
  return (
    <TopicHub
      path="/topics/graphs/connectivity"
      icon={cat.icon}
      eyebrow="GRAPHS · CONNECTIVITY"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an algorithm"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/graphs/connectivity/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
