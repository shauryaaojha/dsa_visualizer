import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/four-pillars/polymorphism/method-overloading"
      title="Method Overloading"
      blurb="Same name, different signatures — the compiler picks the match."
      operation="overloading"
    />
  );
}
