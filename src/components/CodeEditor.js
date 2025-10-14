// frontend/src/components/CodeEditor.js
import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
  const languageMap = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'cpp',
    java: 'java'
  };

  return (
    <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={languageMap[language] || 'javascript'}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;