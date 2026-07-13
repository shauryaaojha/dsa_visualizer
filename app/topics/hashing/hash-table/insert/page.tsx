import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-table/insert"
      title="Insert"
      blurb="Hash to the slot, check the chain for duplicates, insert at the head."
      operation="htInsert"
      defaultData={[15, 11, 27, 8]}
      defaultParams={{ key: 13, m: 7 }}
    />
  );
}
