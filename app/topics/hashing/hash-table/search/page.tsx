import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-table/search"
      title="Search"
      blurb="One hash, one chain — the rest of the table is never touched."
      operation="htSearch"
      defaultData={[15, 11, 27, 8]}
      defaultParams={{ key: 15, m: 7 }}
    />
  );
}
