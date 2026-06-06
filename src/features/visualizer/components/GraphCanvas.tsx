import { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import JsonNode from './JsonNode';
import type { CustomNode, CustomEdge } from '../types';

const nodeTypes: NodeTypes = {
  jsonNode: JsonNode,
};

interface GraphCanvasProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

const FlowInner: React.FC<GraphCanvasProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Sync nodes and edges when initial props change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Automatically fit view with a smooth animation when nodes change
    const timeout = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background color="#cbd5e1" variant={'dots' as any} />
      <Controls />
      <Panel position="top-right">
        <div className="canvas-info">
          JSON Tree View
        </div>
      </Panel>
    </ReactFlow>
  );
};

const GraphCanvas: React.FC<GraphCanvasProps> = (props) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <FlowInner {...props} />
      </ReactFlowProvider>

      <style>{`
        .canvas-info {
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: var(--shadow-md);
          font-weight: 600;
          color: var(--accent-color);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default GraphCanvas;
