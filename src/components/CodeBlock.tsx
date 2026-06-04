import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-900 border border-gray-800 my-6 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/80 border-b border-gray-800">
        <span className="text-xs font-mono font-medium text-gray-400 capitalize">{language || 'bash'}</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors flex items-center justify-center p-1"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="p-5 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
