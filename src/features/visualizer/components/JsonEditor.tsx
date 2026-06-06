import React from 'react';
import Editor from '@monaco-editor/react';
import { FileJson, AlertCircle } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error }) => {
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
