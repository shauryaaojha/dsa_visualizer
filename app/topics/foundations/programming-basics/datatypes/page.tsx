import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/programming-basics/datatypes"
      title="Datatypes"
      blurb="The type decides what + means."
      operation="fDatatypes"
      defaultParams={{}}
    />
  );
}
