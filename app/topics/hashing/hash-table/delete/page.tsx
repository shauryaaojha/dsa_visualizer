import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-table/delete"
      title="Delete"
      blurb="Hash, walk the chain to the node, and unlink it — pointers route around."
      operation="htDelete"
      defaultData={[15, 11, 27, 8]}
      defaultParams={{ key: 15, m: 7 }}
    />
  );
}
