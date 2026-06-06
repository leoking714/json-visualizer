import type { Node, Edge } from '@xyflow/react';

export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export interface JsonNodeData extends Record<string, unknown> {
  label: string;
  remark?: string;
  value?: any;
  type: JsonValueType;
  parentType?: 'object' | 'array';
  isExpanded?: boolean;
  isHighlighted?: boolean;
  selectedPath?: string | null;
  onToggleExpand?: (path: string) => void;
  onUpdateValue?: (path: string, newValue: any) => void;
  onSelect?: (path: string) => void;
  path: string;
}

export type CustomNode = Node<JsonNodeData>;
export type CustomEdge = Edge;
