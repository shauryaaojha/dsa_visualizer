import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/design-patterns/singleton"
      title="Singleton"
      blurb="One instance behind a private constructor — both refs converge on it."
      operation="singleton"
    />
  );
}
