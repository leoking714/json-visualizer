import React, { useState, useMemo, useCallback, useEffect } from 'react';
import JsonEditor from './features/visualizer/components/JsonEditor';
import GraphCanvas from './features/visualizer/components/GraphCanvas';
import { transformJsonToGraph, getAllExpandablePaths, getPathsToMatches } from './features/visualizer/utils/transform';
import { cleanAndFixJson } from './features/visualizer/utils/cleaner';
import { setValueByPath, sortObjectKeys } from './features/visualizer/utils/jsonUtils';
import { ChevronDown, ChevronUp, Sparkles, X, MapPin, Search, SortAsc } from 'lucide-react';
import { JSONVisualizerLogo } from './components/BrandLogo';
import './styles/global.css';

const DEFAULT_JSON = {
  project: "JSON Visualizer",
  version: 1.0,
  active: true,
  features: [
    "Dynamic Rendering",
    "Interactive Tree",
    "Live Editor",
    "Smart Cleaning",
    "Fast Search",
    "Key Sorting"
  ],
  author: {
    name: "Gemini CLI",
    role: "Senior AI Engineer"
  },
  stats: null
};

interface SearchResult {
  path: string;
  label: string;
  value: any;
}

function App() {
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [lastValidParsed, setLastValidParsed] = useState<any>(DEFAULT_JSON);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setLastValidParsed(parsed);
      setError(undefined);
    } catch (e: any) {
      setError(e.message);
    }
  }, [jsonText]);

  const handleExpandAll = () => {
    const allPaths = getAllExpandablePaths(lastValidParsed);
    setExpandedPaths(new Set(allPaths));
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['root']));
    setSelectedPath(null);
  };

  const handleCleanJson = () => {
    const cleaned = cleanAndFixJson(jsonText);
    setJsonText(cleaned);
  };

  const handleSortJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const sorted = sortObjectKeys(parsed);
      setJsonText(JSON.stringify(sorted, null, 2));
    } catch (e) {
      const cleaned = cleanAndFixJson(jsonText);
      try {
        const sorted = sortObjectKeys(JSON.parse(cleaned));
        setJsonText(JSON.stringify(sorted, null, 2));
      } catch (inner) {}
    }
  };

  const onToggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const onSelectNode = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const onUpdateValue = useCallback((path: string, newValue: any) => {
    setLastValidParsed((prev: any) => {
      const updated = setValueByPath(prev, path, newValue);
      setJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const results: SearchResult[] = [];
    const traverse = (val: any, path: string, label: string) => {
      const type = typeof val;
      const isMatch = label.toLowerCase().includes(query) || 
                     (type !== 'object' && val !== null && String(val).toLowerCase().includes(query));
      
      if (isMatch) {
        results.push({ path, label, value: val });
      }

      if (val && type === 'object') {
        if (Array.isArray(val)) {
          val.forEach((item, i) => traverse(item, `${path}.${i}`, `Item ${i}`));
        } else {
          Object.entries(val).forEach(([k, v]) => traverse(v, `${path}.${k}`, k));
        }
      }
    };

    traverse(lastValidParsed, 'root', 'root');
    return results;
  }, [lastValidParsed, searchQuery]);

  const graphData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let effectiveExpandedPaths = new Set(expandedPaths);
    if (query !== '') {
      const matchPaths = getPathsToMatches(lastValidParsed, query);
      matchPaths.forEach(path => effectiveExpandedPaths.add(path));
    }

    const data = transformJsonToGraph(lastValidParsed, effectiveExpandedPaths);
    
    data.nodes = data.nodes.map(node => {
      const isMatch = query !== '' && (
        node.data.label.toLowerCase().includes(query) || 
        String(node.data.value).toLowerCase().includes(query)
      );

      return {
        ...node,
        data: { 
          ...node.data, 
          onToggleExpand,
          onUpdateValue,
          onSelect: onSelectNode,
          selectedPath,
          isHighlighted: isMatch
        }
      };
    });
    
    return data;
  }, [lastValidParsed, expandedPaths, searchQuery, onToggleExpand, onUpdateValue, onSelectNode, selectedPath]);

  return (
    <div className="app-container">
      <div className="editor-panel">
        <div className="app-branding" style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)', background: '#fff' }}>
          <JSONVisualizerLogo size={32} />
        </div>

        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search keys or values..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X 
                size={16} 
                className="clear-icon" 
                onClick={() => setSearchQuery('')} 
              />
            )}
          </div>

          {searchQuery && (
            <div className="search-results-list">
              <div className="results-header">
                {searchResults.length} results found
              </div>
              <div className="results-scroll">
                {searchResults.map((res, i) => (
                  <div 
                    key={i} 
                    className={`result-item ${selectedPath === res.path ? 'active' : ''}`}
                    onClick={() => onSelectNode(res.path)}
                  >
                    <div className="result-label-row">
                      <span className="result-label">{res.label}</span>
                      {typeof res.value !== 'object' && res.value !== null && (
                        <span className="result-value">: {String(res.value)}</span>
                      )}
                    </div>
                    <div className="result-chain">
                      {res.path.split('.').map((part, idx, arr) => {
                        const isIndex = !isNaN(Number(part)) && part !== 'root';
                        const displayPart = isIndex ? `[${part}]` : part;
                        return (
                          <React.Fragment key={idx}>
                            <span className={`chain-step ${isIndex ? 'is-index' : ''}`}>
                              {displayPart}
                            </span>
                            {idx < arr.length - 1 && <span className="chain-arrow">→</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <JsonEditor 
          value={jsonText} 
          onChange={(v) => setJsonText(v || '')} 
          error={error}
          selectedPath={selectedPath}
        />
        
        <div className="global-controls">
          <button onClick={handleCleanJson} className="btn-clean" title="Clean & Fix JSON">
            <Sparkles size={16} />
            <span>Clean</span>
          </button>
          <button onClick={handleSortJson} className="btn-sort" title="Sort Keys Alphabetically">
            <SortAsc size={16} />
            <span>Organize</span>
          </button>
          <button onClick={handleExpandAll} title="Expand All">
            <ChevronDown size={16} />
          </button>
          <button onClick={handleCollapseAll} title="Collapse All">
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
      
      <div className="graph-panel">
        <GraphCanvas nodes={graphData.nodes} edges={graphData.edges} />
      </div>

      <style>{`
        .search-bar-container {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          background: white;
          max-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
        }

        .clear-icon {
          position: absolute;
          right: 10px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 8px 32px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: #f1f5f9;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-input-wrapper input:focus {
          border-color: var(--accent-color);
          background: white;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color), transparent 90%);
        }

        .search-results-list {
          margin-top: 10px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .results-header {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          padding: 6px 10px;
          background: #f1f5f9;
          border-bottom: 1px solid var(--border-color);
          font-weight: 700;
        }

        .results-scroll {
          max-height: 200px;
          overflow-y: auto;
        }

        .result-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s;
        }

        .result-item:last-child { border-bottom: none; }

        .result-item:hover { background: white; }
        .result-item.active { 
          background: white; 
          border-left: 3px solid var(--accent-color); 
        }

        .result-label-row {
          font-size: 0.8rem;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
        }

        .result-label { font-weight: 600; color: var(--text-main); }
        .result-value { color: var(--accent-color); margin-left: 4px; font-family: var(--font-mono); font-size: 0.75rem; }

        .result-chain {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .chain-step {
          font-size: 0.65rem;
          color: var(--text-muted);
          background: #f1f5f9;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .chain-arrow {
          font-size: 0.7rem;
          color: #cbd5e1;
          font-weight: bold;
        }

        .result-item.active .chain-step {
          background: color-mix(in srgb, var(--accent-color), transparent 90%);
          color: var(--accent-color);
          border-color: color-mix(in srgb, var(--accent-color), transparent 80%);
        }

        .global-controls {
          padding: 12px;
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border-color);
          background: #f8fafc;
        }

        .global-controls button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-main);
          font-weight: 500;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-clean {
          flex: 1.5;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }

        .btn-clean:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
          filter: brightness(1.1);
        }

        .btn-sort {
          flex: 1.5;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .btn-sort:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
          filter: brightness(1.1);
        }

        .global-controls button:not(.btn-clean):not(.btn-sort) {
          flex: 0.8;
        }

        .global-controls button:not(.btn-clean):not(.btn-sort):hover {
          background: #f1f5f9;
          border-color: var(--accent-color);
          color: var(--accent-color);
        }
      `}</style>
    </div>
  );
}

export default App;
