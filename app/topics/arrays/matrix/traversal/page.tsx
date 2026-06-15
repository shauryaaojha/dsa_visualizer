import { MatrixVisualizerScreen } from "@/components/visualizer/MatrixVisualizerScreen";

export default function Page() {
  return (
    <MatrixVisualizerScreen
      path="/topics/arrays/matrix/traversal"
      title="Matrix Traversal"
      blurb="Walk a 2-D grid in row-major order — O(m·n)."
      operation="traverse"
      rows={3}
      cols={4}
    />
  );
}
