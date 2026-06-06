import type { Node, Edge } from '@xyflow/react';

export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export interface JsonNodeData {
  label: string;
  remark?: string;
  value?: any;
  type: JsonValueType;
  parentType?: 'object' | 'array';
  isExpanded?: boolean;
  onToggleExpand?: (path: string) => void;
  path: string;
}

export type CustomNode = Node<JsonNodeData>;
export type CustomEdge = Edge;
