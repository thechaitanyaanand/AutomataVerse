import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';

/**
 * Generates all strings over an alphabet up to a given length.
 */
function generateStrings(alphabet, maxLength) {
  const results = [''];  // empty string
  const queue = [''];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current.length >= maxLength) continue;
    for (const sym of alphabet) {
      const next = current + sym;
      results.push(next);
      if (next.length < maxLength) {
        queue.push(next);
      }
    }
  }
  return results;
}

/**
 * StringExplorer — auto-tests many strings to help students discover the language.
 * 
 * Props:
 *   simulateFn: (string) => boolean — returns whether the string is accepted
 *   alphabet: string[] — e.g. ['0', '1']
 */
export default function StringExplorer({ simulateFn, alphabet = ['0', '1'], className }) {
  const [expanded, setExpanded] = useState(false);
  const [maxLen, setMaxLen] = useState(4);
  const [refreshKey, setRefreshKey] = useState(0);

  const results = useMemo(() => {
    if (!simulateFn || !expanded) return [];
    const strings = generateStrings(alphabet, maxLen);
    return strings.map(s => {
      try {
        const accepted = simulateFn(s);
        return { string: s, accepted };
      } catch {
        return { string: s, accepted: false, error: true };
      }
    });
  }, [simulateFn, alphabet, maxLen, expanded, refreshKey]);

  const accepted = results.filter(r => r.accepted);
  const rejected = results.filter(r => !r.accepted);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-xl shadow-black/40 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Beaker size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-text-primary">String Explorer</span>
          <span className="text-xs text-text-muted">— discover your language</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Controls */}
              <div className="flex items-center gap-3 mb-4">
                <label className="text-xs text-text-muted">Max length:</label>
                <div className="flex gap-1">
                  {[3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setMaxLen(n)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-mono transition-all',
                        maxLen === n
                          ? 'bg-flora/20 text-flora-light border border-flora/30'
                          : 'bg-white/5 text-text-muted hover:bg-white/10'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
                  <RefreshCw size={12} /> Refresh
                </Button>
              </div>

              {/* Summary */}
              <div className="flex gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> {accepted.length} accepted
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle size={12} /> {rejected.length} rejected
                </span>
                <span className="text-text-muted">
                  ({results.length} total strings tested)
                </span>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Accepted */}
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Accepted Strings
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {accepted.length === 0 && (
                      <p className="text-xs text-text-muted italic">None</p>
                    )}
                    {accepted.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs font-mono"
                      >
                        <span className="text-emerald-300">
                          {r.string === '' ? 'ε' : r.string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejected */}
                <div>
                  <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <XCircle size={12} /> Rejected Strings
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {rejected.length === 0 && (
                      <p className="text-xs text-text-muted italic">None</p>
                    )}
                    {rejected.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/10 text-xs font-mono"
                      >
                        <span className="text-red-300">
                          {r.string === '' ? 'ε' : r.string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
