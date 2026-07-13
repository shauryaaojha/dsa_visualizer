"use client";

// reactflow host for the UML pages. Transforms the active diagram (filtered by
// the build-step reveal set and the legend's hidden-kind toggles) into reactflow
// nodes/edges. nodeTypes/edgeTypes are defined at module scope (reactflow warns
// otherwise). Custom dark-theme overrides for the Controls/attribution.

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { ActorNode } from "@/components/uml/nodes/ActorNode";
import { SystemBoundaryNode } from "@/components/uml/nodes/SystemBoundaryNode";
import { UmlClassNode } from "@/components/uml/nodes/UmlClassNode";
import { UseCaseNode } from "@/components/uml/nodes/UseCaseNode";
import { UmlEdge } from "@/components/uml/edges/UmlEdge";
import { useUmlStore } from "@/lib/umlStore";

const nodeTypes = {
  class: UmlClassNode,
  actor: ActorNode,
  usecase: UseCaseNode,
  boundary: SystemBoundaryNode,
};
const edgeTypes = { uml: UmlEdge };

export function UmlCanvas() {
  const diagram = useUmlStore((s) => s.diagram);
  const stepIndex = useUmlStore((s) => s.stepIndex);
  const hiddenKinds = useUmlStore((s) => s.hiddenKinds);
  const selectNode = useUmlStore((s) => s.selectNode);

  const visible = useMemo(() => {
    if (!diagram) return new Set<string>();
    return new Set(diagram.buildSteps[Math.min(stepIndex, diagram.buildSteps.length - 1)]?.reveal ?? []);
  }, [diagram, stepIndex]);

  const nodes: Node[] = useMemo(() => {
    if (!diagram) return [];
    return diagram.nodes
      .filter((n) => visible.has(n.id))
      .map((n) => ({
        id: n.id,
        type: n.kind,
        position: n.position,
        data: n.data,
        draggable: n.kind !== "boundary",
        selectable: n.kind !== "boundary",
        zIndex: n.kind === "boundary" ? 0 : 1,
        ...(n.size ? { style: { width: n.size.width, height: n.size.height } } : {}),
      }));
  }, [diagram, visible]);

  const edges: Edge[] = useMemo(() => {
    if (!diagram) return [];
    return diagram.edges
      .filter((e) => visible.has(e.id) && !hiddenKinds.includes(e.kind))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "uml",
        data: { kind: e.kind, label: e.label },
      }));
  }, [diagram, visible, hiddenKinds]);

  return (
    <div className="uml-canvas relative h-full w-full">
      <style>{`
        .uml-canvas .react-flow__controls-button {
          background: rgba(30,26,22,0.9);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: #d6d0c8;
        }
        .uml-canvas .react-flow__controls-button:hover { background: rgba(50,44,38,0.95); }
        .uml-canvas .react-flow__controls-button svg { fill: currentColor; }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.06)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
