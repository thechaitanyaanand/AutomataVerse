import { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { clsx } from 'clsx';

export default function CodeBlock({ code, language = 'javascript', title, copyable = true, className }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const lines = code.split('\n');

  return (
    <div className={clsx(
      'rounded-xl overflow-hidden border border-border bg-void',
      className
    )}>
      {(title || copyable) && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-border">
          {title && (
            <span className="text-xs font-mono text-text-muted">{title}</span>
          )}
          {copyable && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Copy code"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      )}
      <pre ref={codeRef} className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
        <code className="text-text-primary">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-8 text-right pr-4 text-text-muted select-none text-xs leading-relaxed">
                {i + 1}
              </span>
              <span className="flex-1">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
