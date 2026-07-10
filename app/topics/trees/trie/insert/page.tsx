import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/trie/insert"
      title="Trie Insert"
      blurb="Create the letter path; ring the end."
      operation="trieInsert"
      defaultData={[]}
      defaultParams={{ text: "cart", words: ["cat", "car", "card", "dog"] }}
    />
  );
}
