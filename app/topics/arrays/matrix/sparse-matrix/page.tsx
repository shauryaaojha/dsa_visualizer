import { MatrixVisualizerScreen } from "@/components/visualizer/MatrixVisualizerScreen";

export default function Page() {
  return (
    <MatrixVisualizerScreen
      path="/topics/arrays/matrix/sparse-matrix"
      title="Sparse Matrix"
      blurb="Store only the non-zero cells as (row, col, value) triplets to save space."
      operation="sparse"
      rows={4}
      cols={4}
    />
  );
}
