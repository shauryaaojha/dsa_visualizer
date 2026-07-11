import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("strings", "classic-problems")!;
  return (
    <TopicHub
      path="/topics/strings/classic-problems"
      icon={cat.icon}
      eyebrow="STRINGS · LEETCODE"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a problem"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/strings/classic-problems/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
