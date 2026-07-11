import { StringVisualizerScreen } from "@/components/visualizer/StringVisualizerScreen";

export default function Page() {
  return (
    <StringVisualizerScreen
      path="/topics/strings/classic-problems/longest-common-prefix"
      title="Longest Common Prefix"
      blurb="Column-by-column agreement (#14)."
      operation="strCommonPrefix"
      defaultParams={{ text: "flower, flow, flight" }}
    />
  );
}
