import { UmlScreen } from "@/components/uml/UmlScreen";

export default function Page() {
  return (
    <UmlScreen
      path="/topics/oops/uml-diagrams/class-diagram"
      title="Class Diagram"
      blurb="Three-compartment class boxes joined by relationships — build the model up arrow by arrow."
      presetIds={["shape-hierarchy", "library-system"]}
      defaultPreset="shape-hierarchy"
    />
  );
}
