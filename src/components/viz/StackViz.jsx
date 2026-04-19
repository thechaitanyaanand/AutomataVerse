import { motion, AnimatePresence } from 'framer-motion';

/**
 * StackViz – animated vertical stack visualization.
 * @param {string[]} stack       - Array of stack symbols, index 0 = bottom.
 * @param {string}   label       - e.g. "PDA Stack"
 * @param {string}   accentColor - tailwind color token suffix, default "violet"
 */
export default function StackViz({ stack = [], label = 'Stack', accentColor = 'violet' }) {
  const colorMap = {
    violet: {
      cell: 'bg-violet/10 border-violet/30 text-violet-300',
      top:   'bg-violet/25 border-violet/60 text-violet-200 shadow-[0_0_8px_rgba(139,92,246,0.35)]',
      empty: 'border-dashed border-white/10 text-text-muted',
    },
    emerald: {
      cell: 'bg-emerald/10 border-emerald/30 text-emerald-300',
      top:   'bg-emerald/25 border-emerald/60 text-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.35)]',
      empty: 'border-dashed border-white/10 text-text-muted',
    },
  };
  const colors = colorMap[accentColor] || colorMap.violet;

  const displayStack = [...stack].reverse(); // show top at top

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold self-start">{label}</p>
      <div className="flex flex-col items-center gap-1 min-h-[80px]">
        <AnimatePresence mode="popLayout">
          {displayStack.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border text-xs ${colors.empty}`}
            >
              ∅
            </motion.div>
          ) : (
            displayStack.map((sym, i) => {
              const isTop = i === 0;
              return (
                <motion.div
                  key={`${sym}-${displayStack.length - 1 - i}`}
                  layout
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    font-mono text-sm font-bold border transition-all
                    ${isTop ? colors.top : colors.cell}
                  `}
                >
                  {sym}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      {/* Base marker */}
      <div className="w-14 h-0.5 bg-white/10 rounded-full" />
      <p className="text-[9px] text-text-muted">← bottom</p>
    </div>
  );
}
