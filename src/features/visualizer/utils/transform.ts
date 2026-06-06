import type { CustomNode, CustomEdge, JsonValueType } from '../types';
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 60;

const getType = (value: any): JsonValueType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonValueType;
};

export const transformJsonToGraph = (json: any, expandedPaths: Set<string>) => {
  const nodes: CustomNode[] = [];
  const edges: CustomEdge[] = [];

  const traverse = (key: string, value: any, parentId: string | null = null, path = 'root', remark?: string, parentType?: 'object' | 'array') => {
    const id = path;
    const type = getType(value);
    const isExpandable = type === 'object' || type === 'array';
    const isExpanded = expandedPaths.has(path);

    nodes.push({
      id,
      type: 'jsonNode',
      data: {
        label: key,
        remark,
        value: isExpandable ? undefined : value,
        type,
        parentType,
        path,
        isExpanded,
      },
      position: { x: 0, y: 0 },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: true,
        style: { 
          strokeWidth: 2, 
          stroke: `var(--color-${type})`,
          strokeDasharray: parentType === 'array' ? '5,5' : 'none'
        },
      });
    }

    if (isExpandable && isExpanded) {
      if (type === 'object' && value) {
        Object.entries(value).forEach(([childKey, childValue]) => {
          traverse(childKey, childValue, id, `${path}.${childKey}`, undefined, 'object');
        });
      } else if (type === 'array' && Array.isArray(value)) {
        value.forEach((item: any, index: number) => {
          traverse(`Item ${index}`, item, id, `${path}.${index}`, `Index: ${index}`, 'array');
        });
      }
    }
  };

  traverse('root', json);

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const positionedNodes = nodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPos.x - nodeWidth / 2,
        y: nodeWithPos.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: positionedNodes, edges };
};

export const getAllExpandablePaths = (json: any, path = 'root'): string[] => {
  const paths: string[] = [];
  const type = getType(json);

  if (type === 'object' || type === 'array') {
    paths.push(path);
    if (type === 'object' && json) {
      Object.entries(json).forEach(([key, value]) => {
        paths.push(...getAllExpandablePaths(value, `${path}.${key}`));
      });
    } else if (type === 'array' && Array.isArray(json)) {
      json.forEach((item, index) => {
        paths.push(...getAllExpandablePaths(item, `${path}.${index}`));
      });
    }
  }

  return paths;
};

export const getPathsToMatches = (json: any, query: string, path = 'root'): Set<string> => {
  const paths = new Set<string>();
  if (!query) return paths;

  const lowQuery = query.toLowerCase();
  
  const traverse = (val: any, currentPath: string): boolean => {
    let hasMatchInDescendants = false;
    const type = getType(val);

    const keyMatch = currentPath.split('.').pop()?.toLowerCase().includes(lowQuery);
    const valueMatch = type !== 'object' && type !== 'array' && String(val).toLowerCase().includes(lowQuery);

    if (keyMatch || valueMatch) {
      hasMatchInDescendants = true;
    }

    if (type === 'object' && val) {
      Object.entries(val).forEach(([k, v]) => {
        if (traverse(v, `${currentPath}.${k}`)) {
          hasMatchInDescendants = true;
        }
      });
    } else if (type === 'array' && Array.isArray(val)) {
      val.forEach((item, index) => {
        if (traverse(item, `${currentPath}.${index}`)) {
          hasMatchInDescendants = true;
        }
      });
    }

    if (hasMatchInDescendants && (type === 'object' || type === 'array')) {
      paths.add(currentPath);
    }

    return hasMatchInDescendants;
  };

  traverse(json, path);
  return paths;
};
