import { UmlScreen } from "@/components/uml/UmlScreen";

export default function Page() {
  return (
    <UmlScreen
      path="/topics/oops/uml-diagrams/class-relationships"
      title="Class Relationships"
      blurb="The six connectors — association, aggregation, composition, inheritance, realization, dependency."
      presetIds={["inheritance", "realization", "association", "aggregation", "composition", "dependency"]}
      defaultPreset="inheritance"
    />
  );
}
