import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { JsonNodeData } from '../types';
import { Box, Hash, Type, ToggleLeft, List, Braces, ChevronRight, ChevronDown } from 'lucide-react';

const iconMap = {
  string: <Type size={14} />,
  number: <Hash size={14} />,
  boolean: <ToggleLeft size={14} />,
  null: <Box size={14} />,
  object: <Braces size={14} />,
  array: <List size={14} />,
};

const JsonNode = ({ data }: { data: JsonNodeData }) => {
  const { label, value, type, isExpanded, onToggleExpand, path, remark, parentType } = data;
  const isExpandable = type === 'object' || type === 'array';

  return (
    <div 
      className={`json-node type-${type} parent-${parentType || 'none'} ${isExpanded ? 'expanded' : ''}`}
      onClick={() => isExpandable && onToggleExpand?.(path)}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
      
      <div className="node-content">
        <div className="node-icon">{iconMap[type]}</div>
        <div className="node-info">
          <div className="node-header">
            <span className="node-label">{label}</span>
            {remark && <span className="node-remark">{remark}</span>}
          </div>
          {value !== undefined && (
            <span className="node-value">{String(value)}</span>
          )}
        </div>
        {isExpandable && (
          <div className="expand-icon">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      <div className="node-tooltip">
        <div className="tooltip-row"><strong>Type:</strong> <span>{type}</span></div>
        <div className="tooltip-row"><strong>Path:</strong> <span>{path}</span></div>
        {value !== undefined && (
          <div className="tooltip-row"><strong>Value:</strong> <span>{String(value)}</span></div>
        )}
        <div className="tooltip-row"><strong>Source:</strong> <span>{parentType === 'array' ? 'Array Index' : 'Object Key'}</span></div>
      </div>

      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />

      <style>{`
        .json-node {
          padding: 8px 12px;
          border-radius: var(--radius-md);
          background: white;
          border: 2px solid var(--color-${type});
          border-style: ${parentType === 'array' ? 'dashed' : 'solid'};
          box-shadow: var(--shadow-md);
          min-width: 180px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }

        .json-node:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }

        .node-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .node-remark {
          font-size: 0.65rem;
          background: #f1f5f9;
          color: var(--text-muted);
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        /* Tooltip Styles */
        .node-tooltip {
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          background: #1e293b;
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          width: 220px;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
        }

        .json-node:hover .node-tooltip {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 8px;
        }

        .tooltip-row strong {
          color: #94a3b8;
        }

        .tooltip-row span {
          word-break: break-all;
          text-align: right;
        }

        .expand-icon {
          margin-left: auto;
          color: var(--text-muted);
        }

        .node-icon {
          color: var(--color-${type});
          background: color-mix(in srgb, var(--color-${type}), transparent 90%);
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .node-label {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-main);
          white-space: nowrap;
        }

        .node-value {
          font-size: 0.75rem;
          color: var(--color-${type});
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
      `}</style>
    </div>
  );
};

export default memo(JsonNode);
