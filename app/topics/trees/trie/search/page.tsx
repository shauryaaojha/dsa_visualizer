import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/trie/search"
      title="Trie Search"
      blurb="Follow letters; found ⇔ end ring."
      operation="trieSearch"
      defaultData={[]}
      defaultParams={{ text: "car", words: ["cat", "car", "card", "dog"] }}
    />
  );
}
