import { StringVisualizerScreen } from "@/components/visualizer/StringVisualizerScreen";

export default function Page() {
  return (
    <StringVisualizerScreen
      path="/topics/strings/classic-problems/valid-anagram"
      title="Valid Anagram"
      blurb="Compare letter tallies, not positions (#242)."
      operation="strAnagram"
      defaultParams={{ text: "listen", text2: "silent" }}
    />
  );
}
