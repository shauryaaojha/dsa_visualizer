import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("linked-list", "classic-problems")!;
  return (
    <TopicHub
      path="/topics/linked-list/classic-problems"
      icon={cat.icon}
      eyebrow="LINKED LIST · CLASSIC PROBLEMS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a problem"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/linked-list/classic-problems/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
