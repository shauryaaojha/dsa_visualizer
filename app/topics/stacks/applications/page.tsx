import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("stacks", "applications")!;
  return (
    <TopicHub
      path="/topics/stacks/applications"
      icon={cat.icon}
      eyebrow="STACKS · APPLICATIONS"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose an operation"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/stacks/applications/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
