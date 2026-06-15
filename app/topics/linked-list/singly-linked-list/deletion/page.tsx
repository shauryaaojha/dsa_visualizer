import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("linked-list", "singly-linked-list")!;
  const group = cat.leaves.find((l) => l.slug === "deletion")!;
  return (
    <TopicHub
      path="/topics/linked-list/singly-linked-list/deletion"
      icon={group.icon}
      eyebrow="SINGLY LINKED LIST · DELETION"
      title={group.title}
      blurb={group.blurb}
      cardsHeading="Choose a variant"
      cards={(group.children ?? []).map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/linked-list/singly-linked-list/deletion/${l.slug}`,
        complexity: l.complexity,
      }))}
    />
  );
}
