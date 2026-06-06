import React, { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FileJson, AlertCircle } from 'lucide-react';
import jsonSourceMap from 'json-source-map';

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
  selectedPath?: string | null;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, selectedPath }) => {
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current || !selectedPath) {
      if (editorRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    try {
      // 1. Map path to pointer (e.g. root.a.b -> /a/b)
      const pathParts = selectedPath.replace(/^root\.?/, '').split('.').filter(Boolean);
      const pointer = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
      
      // 2. Parse source map
      const sourceMap = jsonSourceMap.parse(value);
      const entry = sourceMap.pointers[pointer];

      if (entry) {
        // Use key line if available, otherwise value line
        const line = entry.key ? entry.key.line + 1 : (entry.value?.line ?? 0) + 1;
        
        // Scroll to line
        editorRef.current.revealLineInCenter(line);

        // 3. Add decoration (highlight)
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
          {
            range: {
              startLineNumber: line,
              startColumn: 1,
              endLineNumber: line,
              endColumn: 1000,
            },
            options: {
              isWholeLine: true,
              className: 'monaco-line-highlight',
              glyphMarginClassName: 'monaco-glyph-highlight',
            },
          },
        ]);
      }
    } catch (e) {
      // Quietly ignore parse errors for highlighting
    }
  }, [selectedPath, value]);

  return (
    <div className="json-editor-container">
      <div className="editor-header">
        <FileJson size={18} />
        <span>JSON Input</span>
      </div>
      
      <div className="editor-wrapper">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Inject custom CSS for Monaco Decorations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .monaco-line-highlight {
          background: #6366f122 !important;
          border-left: 4px solid var(--accent-color) !important;
        }
      `}} />

      <style>{`
        .json-editor-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .editor-header {
          padding: 12px 16px;
          background: #f1f5f9;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.9rem;
        }

        .editor-wrapper {
          flex: 1;
        }

        .error-banner {
          background: #fef2f2;
          color: var(--error-color);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          border-top: 1px solid #fee2e2;
        }
      `}</style>
    </div>
  );
};

export default JsonEditor;
