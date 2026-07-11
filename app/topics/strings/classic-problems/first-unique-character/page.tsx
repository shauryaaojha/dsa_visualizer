import { StringVisualizerScreen } from "@/components/visualizer/StringVisualizerScreen";

export default function Page() {
  return (
    <StringVisualizerScreen
      path="/topics/strings/classic-problems/first-unique-character"
      title="First Unique Character"
      blurb="Count pass + scan pass (#387)."
      operation="strFirstUnique"
      defaultParams={{ text: "leetcode" }}
    />
  );
}
