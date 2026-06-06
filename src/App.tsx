import { useState, useMemo } from 'react';
import JsonEditor from './features/visualizer/components/JsonEditor';
import GraphCanvas from './features/visualizer/components/GraphCanvas';
import { transformJsonToGraph, getAllExpandablePaths } from './features/visualizer/utils/transform';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './styles/global.css';

const DEFAULT_JSON = {
  project: "JSON Visualizer",
  version: 1.0,
  active: true,
  features: [
    "Dynamic Rendering",
    "Interactive Tree",
    "Live Editor"
  ],
  author: {
    name: "Gemini CLI",
    role: "Senior AI Engineer"
  },
  stats: null
};

function App() {
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [error, setError] = useState<string>();

  const handleExpandAll = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const allPaths = getAllExpandablePaths(parsed);
      setExpandedPaths(new Set(allPaths));
    } catch (e) {
      // Ignore if JSON is invalid
    }
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['root']));
  };

  const onToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const graphData = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(undefined);
      const data = transformJsonToGraph(parsed, expandedPaths);
      
      // Inject onToggleExpand into node data
      data.nodes = data.nodes.map(node => ({
        ...node,
        data: { ...node.data, onToggleExpand }
      }));
      
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [jsonText, expandedPaths]);

  return (
    <div className="app-container">
      <div className="editor-panel">
        <JsonEditor 
          value={jsonText} 
          onChange={(v) => setJsonText(v || '')} 
          error={error}
        />
        
        <div className="global-controls">
          <button onClick={handleExpandAll} title="Expand All">
            <ChevronDown size={16} />
            <span>Expand All</span>
          </button>
          <button onClick={handleCollapseAll} title="Collapse All">
            <ChevronUp size={16} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>
      
      <div className="graph-panel">
        {graphData ? (
          <GraphCanvas nodes={graphData.nodes} edges={graphData.edges} />
        ) : (
          <div className="placeholder">
            <div className="placeholder-content">
              <h2>Parsing Error</h2>
              <p>Please check your JSON format in the editor.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .global-controls {
          padding: 12px;
          display: flex;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          background: #f8fafc;
        }

        .global-controls button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-main);
          font-weight: 500;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .global-controls button:hover {
          background: #f1f5f9;
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .placeholder-content {
          text-align: center;
          color: var(--text-muted);
        }

        .placeholder h2 {
          color: var(--error-color);
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export default App;
