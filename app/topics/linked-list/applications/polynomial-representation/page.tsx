import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/applications/polynomial-representation"
      title="Polynomial Representation"
      blurb="Store terms (coef, exp) as list nodes."
      kind="singly"
      operation="polynomial"
      defaultData={[5, 0, 3, 0, 1]}
    />
  );
}
