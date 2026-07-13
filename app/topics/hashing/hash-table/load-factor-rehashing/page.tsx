import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-table/load-factor-rehashing"
      title="Load Factor & Rehashing"
      blurb="Watch α = n/m climb past 0.75 — then the table doubles and every key moves."
      operation="loadFactor"
      defaultData={[12, 44, 13, 88, 23, 94, 11]}
      defaultParams={{ m: 5 }}
    />
  );
}
