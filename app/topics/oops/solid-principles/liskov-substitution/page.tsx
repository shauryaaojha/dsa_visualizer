import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/solid-principles/liskov-substitution"
      title="Liskov Substitution"
      blurb="Square-extends-Rectangle breaks area() — subtypes must be substitutable."
      operation="lsp"
    />
  );
}
