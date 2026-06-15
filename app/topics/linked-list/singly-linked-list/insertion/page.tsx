import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("linked-list", "singly-linked-list")!;
  const group = cat.leaves.find((l) => l.slug === "insertion")!;
  return (
    <TopicHub
      path="/topics/linked-list/singly-linked-list/insertion"
      icon={group.icon}
      eyebrow="SINGLY LINKED LIST · INSERTION"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose a variant"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/linked-list/singly-linked-list/insertion/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
