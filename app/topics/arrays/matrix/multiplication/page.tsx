import { MatrixVisualizerScreen } from "@/components/visualizer/MatrixVisualizerScreen";

export default function Page() {
  return (
    <MatrixVisualizerScreen
      path="/topics/arrays/matrix/multiplication"
      title="Matrix Multiplication"
      blurb="Each C[i][j] is the dot product of row i of A and column j of B."
      operation="multiplication"
      rows={2}
      cols={3}
      p={2}
    />
  );
}
