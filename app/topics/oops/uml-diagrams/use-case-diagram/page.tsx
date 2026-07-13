import { UmlScreen } from "@/components/uml/UmlScreen";

export default function Page() {
  return (
    <UmlScreen
      path="/topics/oops/uml-diagrams/use-case-diagram"
      title="Use Case Diagram"
      blurb="Actors, use-case ovals and a system boundary — with «include» and «extend»."
      presetIds={["atm", "online-shopping"]}
      defaultPreset="atm"
    />
  );
}
