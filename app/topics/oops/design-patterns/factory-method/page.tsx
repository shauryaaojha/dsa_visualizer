import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/design-patterns/factory-method"
      title="Factory Method"
      blurb="A factory decides the concrete class; the client codes against the interface."
      operation="factoryMethod"
    />
  );
}
