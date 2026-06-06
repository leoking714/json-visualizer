import React, { memo, useState, useEffect, useRef } from 'react';
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
  const { 
    label, value, type, isExpanded, onToggleExpand, onUpdateValue, 
    onSelect, selectedPath, path, remark, parentType, isHighlighted 
  } = data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  
  const isExpandable = type === 'object' || type === 'array';
  const isSelected = selectedPath === path;

  // Sync local edit value
  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  // If node is no longer selected, exit editing mode
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
    }
  }, [isSelected]);

  const handleSave = () => {
    let finalValue: any = editValue;
    if (type === 'number') finalValue = Number(editValue);
    if (type === 'boolean') {
      const lower = editValue.toLowerCase();
      if (lower === 'true') finalValue = true;
      else if (lower === 'false') finalValue = false;
      else finalValue = Boolean(editValue);
    }
    if (type === 'null') finalValue = null;

    onUpdateValue?.(path, finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  // Handle Single Click (Selection & Expansion)
  const handleSingleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Selection logic
    onSelect?.(path);
    
    // Toggle logic
    if (isExpandable) {
      onToggleExpand?.(path);
    }
  };

  // Handle Double Click (Enter Edit Mode)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpandable && type !== 'null') {
      setIsEditing(true);
    }
  };

  return (
    <div 
      className={`json-node type-${type} parent-${parentType || 'none'} ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
      
      <div className="node-content">
        <div className="node-icon-wrapper">
          <div className="node-icon">{iconMap[type]}</div>
        </div>
        
        <div className="node-info">
          <div className="node-header">
            <span className="node-label">{label}</span>
            {remark && <span className="node-remark">{remark}</span>}
          </div>

          {!isExpandable && type !== 'null' && (
            <div className="value-editor-zone">
              {isEditing ? (
                <div className="edit-input-group" onClick={(e) => e.stopPropagation()}>
                  <input 
                    autoFocus
                    className="edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={handleSave}
                  />
                </div>
              ) : (
                <span className="node-value">{String(value)}</span>
              )}
            </div>
          )}
        </div>

        {isExpandable && (
          <div className="expand-icon">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {!isEditing && (
        <div className="node-tooltip">
          <div className="tooltip-row"><strong>Type:</strong> <span>{type}</span></div>
          <div className="tooltip-row"><strong>Path:</strong> <span>{path}</span></div>
          {value !== undefined && (
            <div className="tooltip-row"><strong>Value:</strong> <span>{String(value)}</span></div>
          )}
          <div className="tooltip-row"><strong>Source:</strong> <span>{parentType === 'array' ? 'Array Index' : 'Object Key'}</span></div>
          <div className="tooltip-hint">Click: Select/Toggle | Double-Click: Edit</div>
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />

      <style>{`
        .json-node {
          padding: 8px 12px;
          border-radius: var(--radius-md);
          background: white;
          border: 2px solid var(--color-${type});
          border-style: ${parentType === 'array' ? 'dashed' : 'solid'};
          box-shadow: var(--shadow-md);
          min-width: 200px;
          transition: 
            transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
            box-shadow 0.3s ease,
            background-color 0.2s ease,
            border-color 0.2s ease;
          cursor: pointer;
          position: relative;
          user-select: none; /* Prevents text selection on double click */
        }

        .json-node.selected {
          border-color: var(--accent-color) !important;
          border-style: solid !important;
          background: color-mix(in srgb, var(--accent-color), white 96%);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color), transparent 80%), var(--shadow-lg);
          transform: translateY(-2px) scale(1.02);
        }

        .json-node.highlighted {
          border-color: #f59e0b !important;
          box-shadow: 0 0 12px #f59e0b66, var(--shadow-lg) !important;
          background: #fffbeb;
          z-index: 50;
        }

        .json-node:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }

        .node-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-icon-wrapper {
          display: flex;
          align-items: center;
        }

        .node-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .node-label {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .node-remark {
          font-size: 0.65rem;
          background: #f1f5f9;
          color: var(--text-muted);
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
        }

        .value-editor-zone {
          min-height: 18px;
          border-radius: 4px;
        }

        .edit-input-group {
          width: 100%;
        }

        .edit-input {
          width: 100%;
          border: 1px solid var(--accent-color);
          border-radius: 4px;
          padding: 1px 4px;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          outline: none;
          background: white;
        }

        .node-value {
          font-size: 0.75rem;
          color: var(--color-${type});
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .expand-icon {
          margin-left: auto;
          color: var(--text-muted);
        }

        /* Tooltip Styles */
        .node-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(10px) scale(0.9);
          background: #1e293b;
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          width: 220px;
          pointer-events: none;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
        }

        .json-node:hover .node-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
          transition-duration: 0.2s;
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 8px;
        }

        .tooltip-row strong { color: #94a3b8; }
        .tooltip-row span { word-break: break-all; text-align: right; }
        .tooltip-hint {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid #334155;
          color: #6366f1;
          font-weight: 600;
          font-size: 0.65rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default memo(JsonNode);
