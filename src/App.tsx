import React, { useState, useMemo, useCallback, useEffect } from 'react';
import JsonEditor from './features/visualizer/components/JsonEditor';
import GraphCanvas from './features/visualizer/components/GraphCanvas';
import { transformJsonToGraph, getAllExpandablePaths, getPathsToMatches } from './features/visualizer/utils/transform';
import { cleanAndFixJson } from './features/visualizer/utils/cleaner';
import { ChevronDown, ChevronUp, Sparkles, Search, X } from 'lucide-react';
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
    "Fast Search"
  ],
  author: {
    name: "Gemini CLI",
    role: "Senior AI Engineer"
  },
  stats: null
};

function App() {
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [lastValidParsed, setLastValidParsed] = useState<any>(DEFAULT_JSON);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>();

  // Use an effect to handle parsing logic.
  // This allows the UI to stay smooth and the graph to stay visible even during invalid input states.
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setLastValidParsed(parsed);
      setError(undefined);
    } catch (e: any) {
      // We only update the error message, but keep 'lastValidParsed' as is.
      // This ensures the tree visualization doesn't disappear while typing.
      setError(e.message);
    }
  }, [jsonText]);

  const handleExpandAll = () => {
    const allPaths = getAllExpandablePaths(lastValidParsed);
    setExpandedPaths(new Set(allPaths));
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['root']));
  };

  const handleCleanJson = () => {
    const cleaned = cleanAndFixJson(jsonText);
    setJsonText(cleaned);
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

  const graphData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Auto-expand paths that lead to matches
    let effectiveExpandedPaths = new Set(expandedPaths);
    if (query !== '') {
      const matchPaths = getPathsToMatches(lastValidParsed, query);
      matchPaths.forEach(path => effectiveExpandedPaths.add(path));
    }

    const data = transformJsonToGraph(lastValidParsed, effectiveExpandedPaths);
    
    // Inject onToggleExpand and Search Highlight logic
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
          isHighlighted: isMatch
        }
      };
    });
    
    return data;
  }, [lastValidParsed, expandedPaths, searchQuery, onToggleExpand]);

  return (
    <div className="app-container">
      <div className="editor-panel">
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
        </div>

        <JsonEditor 
          value={jsonText} 
          onChange={(v) => setJsonText(v || '')} 
          error={error}
        />
        
        <div className="global-controls">
          <button onClick={handleCleanJson} className="btn-clean" title="Clean & Fix JSON">
            <Sparkles size={16} />
            <span>Clean & Fix</span>
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
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
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
          flex: 2;
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

        .global-controls button:not(.btn-clean) {
          flex: 1;
        }

        .global-controls button:not(.btn-clean):hover {
          background: #f1f5f9;
          border-color: var(--accent-color);
          color: var(--accent-color);
        }
      `}</style>
    </div>
  );
}

export default App;
