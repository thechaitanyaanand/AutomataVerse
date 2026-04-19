import { motion, AnimatePresence } from 'framer-motion';

/**
 * InputQueue – visualises the input tape as a horizontal queue.
 * The head position highlights the current character being read.
 * @param {string}  inputString  - Full input (e.g. "aabb")
 * @param {number}  headIndex    - Index of the character currently being read (0-indexed)
 */
export default function InputQueue({ inputString = '', headIndex = 0 }) {
  if (!inputString) return null;
  const chars = inputString.split('');

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Input Queue</p>
      <div className="flex items-center gap-1 flex-wrap">
        <AnimatePresence mode="popLayout">
          {chars.map((ch, i) => {
            const isHead = i === headIndex;
            const isDone = i < headIndex;
            return (
              <motion.div
                key={`${ch}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.7, y: -8 }}
                animate={{ opacity: isDone ? 0.25 : 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`
                  relative w-7 h-7 rounded-lg flex items-center justify-center font-mono text-sm font-bold
                  border transition-all duration-200
                  ${isHead
                    ? 'bg-emerald/20 border-emerald text-emerald shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                    : isDone
                    ? 'bg-void/30 border-white/5 text-text-muted'
                    : 'bg-white/5 border-white/10 text-text-primary'
                  }
                `}
              >
                {ch}
                {isHead && (
                  <motion.div
                    layoutId="queue-pointer"
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderBottom: '4px solid #34D399',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {/* End marker */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs border border-dashed border-white/10 text-text-muted">
          ⊣
        </div>
      </div>
    </div>
  );
}
