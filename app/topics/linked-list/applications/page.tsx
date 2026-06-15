import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("linked-list", "applications")!;
  return (
    <TopicHub
      path="/topics/linked-list/applications"
      icon={cat.icon}
      eyebrow="LINKED LIST · APPLICATIONS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a problem"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/linked-list/applications/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
