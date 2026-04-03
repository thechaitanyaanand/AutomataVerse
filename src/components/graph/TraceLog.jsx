import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, List, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function TraceLog({ simulation, className }) {
  const [expanded, setExpanded] = useState(true);

  if (!simulation || !simulation.steps || simulation.steps.length === 0) {
    return null;
  }

  const { steps, currentStep, status } = simulation;
  const lastStep = steps[steps.length - 1];
  const isAccepted = lastStep?.isAccepting;
  const isDone = status === 'done';

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
          <List size={16} className="text-flora-light" />
          <span className="text-sm font-semibold text-text-primary">Simulation Trace</span>
          <span className="text-xs text-text-muted ml-1">
            ({currentStep + 1}/{steps.length} steps)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isDone && (
            <span className={clsx(
              'text-xs font-medium px-2.5 py-0.5 rounded-full',
              isAccepted
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'bg-red-500/15 text-red-400 border border-red-500/25'
            )}>
              {isAccepted ? '✓ Accepted' : '✗ Rejected'}
            </span>
          )}
          {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 max-h-56 overflow-y-auto space-y-0.5">
              {steps.map((step, i) => {
                const isCurrent = i === currentStep;
                const isPast = i < currentStep;
                const isFuture = i > currentStep;
                const isLast = i === steps.length - 1 && isDone;

                return (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200',
                      isCurrent && 'bg-flora/10 border border-flora/20 text-text-primary',
                      isPast && 'text-text-muted opacity-60',
                      isFuture && 'text-text-muted opacity-30',
                    )}
                  >
                    {/* Step number */}
                    <span className={clsx(
                      'w-5 text-right shrink-0',
                      isCurrent ? 'text-flora-light font-bold' : ''
                    )}>
                      {i}
                    </span>

                    {/* Content */}
                    {i === 0 ? (
                      <span>
                        <span className="text-cyan-400">start</span> at{' '}
                        <span className="text-text-primary font-semibold">{step.state || step.from || 'q0'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="text-text-secondary">{step.from || steps[i-1]?.state}</span>
                        <span className="text-text-muted mx-0.5">─[</span>
                        <span className="text-amber-400 font-bold">{step.symbol ?? step.input ?? '?'}</span>
                        <span className="text-text-muted">]─▸</span>
                        <span className="text-text-primary font-semibold">{step.state || step.to}</span>
                      </span>
                    )}

                    {/* End status */}
                    {isLast && isDone && (
                      <span className="ml-auto">
                        {isAccepted
                          ? <CheckCircle2 size={14} className="text-emerald-400" />
                          : <XCircle size={14} className="text-red-400" />
                        }
                      </span>
                    )}

                    {/* Current indicator */}
                    {isCurrent && !isLast && (
                      <ArrowRight size={12} className="ml-auto text-flora-light animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
