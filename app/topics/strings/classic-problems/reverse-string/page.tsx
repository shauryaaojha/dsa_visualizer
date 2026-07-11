import { StringVisualizerScreen } from "@/components/visualizer/StringVisualizerScreen";

export default function Page() {
  return (
    <StringVisualizerScreen
      path="/topics/strings/classic-problems/reverse-string"
      title="Reverse String"
      blurb="Two pointers swap inward (#344)."
      operation="strReverse"
      defaultParams={{ text: "visualize" }}
    />
  );
}
