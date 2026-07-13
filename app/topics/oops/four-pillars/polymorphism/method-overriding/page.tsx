import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/four-pillars/polymorphism/method-overriding"
      title="Method Overriding"
      blurb="Animal a = new Dog(); a.speak() — the object's vtable decides at runtime."
      operation="overriding"
    />
  );
}
