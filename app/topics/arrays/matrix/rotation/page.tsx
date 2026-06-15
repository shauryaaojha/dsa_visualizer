import { MatrixVisualizerScreen } from "@/components/visualizer/MatrixVisualizerScreen";

export default function Page() {
  return (
    <MatrixVisualizerScreen
      path="/topics/arrays/matrix/rotation"
      title="Matrix Rotation"
      blurb="Rotate the grid 90° clockwise: M[r][c] → R[c][rows−1−r]."
      operation="rotation"
      rows={3}
      cols={3}
    />
  );
}
