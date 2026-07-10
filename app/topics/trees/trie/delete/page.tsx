import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/trie/delete"
      title="Trie Delete"
      blurb="Un-ring, then prune unused letters."
      operation="trieDelete"
      defaultData={[]}
      defaultParams={{ text: "card", words: ["cat", "car", "card", "dog"] }}
    />
  );
}
