import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-functions/string-hashing"
      title="String Hashing"
      blurb="The rolling hash: h = (h·31 + code) mod m, one character at a time."
      operation="stringHashing"
      defaultParams={{ text: "hello", m: 11 }}
    />
  );
}
