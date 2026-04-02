import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function TapeDisplay({
  tape = new Map(),
  headPosition = 0,
  blankSymbol = '_',
  className,
}) {
  // Determine visible range
  const allPositions = [...tape.keys(), headPosition];
  const minPos = Math.min(...allPositions, headPosition - 5);
  const maxPos = Math.max(...allPositions, headPosition + 5);

  const cells = [];
  for (let i = minPos - 2; i <= maxPos + 2; i++) {
    cells.push({
      position: i,
      symbol: tape.get(i) ?? blankSymbol,
      isHead: i === headPosition,
    });
  }

  return (
    <div className={clsx('overflow-x-auto py-4', className)}>
      <div className="flex items-start justify-center min-w-max gap-0">
        {cells.map((cell) => (
          <motion.div
            key={cell.position}
            layout
            className="flex flex-col items-center"
          >
            {cell.isHead && (
              <motion.div
                layoutId="tm-head"
                className="text-cyan mb-1 text-xs font-bold"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ▼
              </motion.div>
            )}
            {!cell.isHead && <div className="h-5" />}
            <div
              className={clsx(
                'w-10 h-10 flex items-center justify-center border text-sm font-mono transition-all duration-200',
                cell.isHead
                  ? 'bg-violet/20 border-violet text-text-primary shadow-lg shadow-violet/20 scale-110 z-10'
                  : 'bg-surface border-border text-text-secondary',
                cell.symbol === blankSymbol && !cell.isHead && 'text-text-muted'
              )}
            >
              {cell.symbol === blankSymbol ? '␣' : cell.symbol}
            </div>
            <span className="text-[9px] text-text-muted mt-1 font-mono">
              {cell.position}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
