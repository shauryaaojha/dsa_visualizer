import { TopicHub } from "@/components/topic/TopicHub";
import { getCategory } from "@/data/curriculum";

export default function Hub() {
  const cat = getCategory("oops", "uml-diagrams")!;
  return (
    <TopicHub
      path="/topics/oops/uml-diagrams"
      icon={cat.icon}
      eyebrow="OOP · UML"
      title={cat.title}
      blurb={cat.blurb}
      cardsHeading="Choose a diagram"
      cards={cat.leaves.map((l) => ({
        title: l.title,
        blurb: l.blurb,
        icon: l.icon,
        href: `/topics/oops/uml-diagrams/${l.slug}`,
        complexity: l.children ? undefined : l.complexity,
      }))}
    />
  );
}
