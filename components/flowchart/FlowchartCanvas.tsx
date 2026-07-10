'use client';

import { useMemo, forwardRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  StartNode,
  EndNode,
  DeclareNode,
  InputNode,
  OutputNode,
  AssignNode,
  IfNode,
  WhileNode,
  ForNode,
  CommentNode,
} from './CustomNodes';
import { FlowchartModel } from '@/lib/types';

interface FlowchartCanvasProps {
  flowchart: FlowchartModel;
}

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  declare: DeclareNode,
  input: InputNode,
  output: OutputNode,
  assign: AssignNode,
  if: IfNode,
  while: WhileNode,
  for: ForNode,
  comment: CommentNode,
};

function Canvas({ flowchart }: FlowchartCanvasProps) {
  const nodes: Node[] = useMemo(
    () =>
      flowchart.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { label: node.data.label || node.type },
      })),
    [flowchart.nodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      flowchart.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: true,
      })),
    [flowchart.edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

const FlowchartCanvas = forwardRef<HTMLDivElement, FlowchartCanvasProps>(
  ({ flowchart }, ref) => {
    return (
      <div ref={ref} className="w-full h-full min-h-[500px] bg-white rounded-xl overflow-hidden">
        <ReactFlowProvider>
          <Canvas flowchart={flowchart} />
        </ReactFlowProvider>
      </div>
    );
  }
);

FlowchartCanvas.displayName = 'FlowchartCanvas';

export default FlowchartCanvas;
