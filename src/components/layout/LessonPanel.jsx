import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, BookOpen, ChevronRight, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { audio } from '@/lib/audio';
import { fireConfetti } from '@/lib/confetti';

export default function LessonPanel({ title, description, steps, completedSteps, onFinish }) {
  const [expanded, setExpanded] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [fullyCompleted, setFullyCompleted] = useState(false);

  // Automatically advance step when completed
  useEffect(() => {
    let nextUncompleted = 0;
    let allDone = true;
    
    for (let i = 0; i < steps.length; i++) {
      if (!completedSteps[i]) {
        nextUncompleted = i;
        allDone = false;
        break;
      }
    }

    if (allDone && !fullyCompleted) {
      setFullyCompleted(true);
      audio.playSuccess();
      fireConfetti();
      if (onFinish) onFinish();
    } else if (!allDone && fullyCompleted) {
      setFullyCompleted(false); // In case they undo a step
    }

    // Only auto-advance if they haven't manually clicked something far away, or strictly follow sequence
    setActiveStepIndex(nextUncompleted);
  }, [completedSteps, steps.length, fullyCompleted, onFinish]);

  // Handle manual step click
  const handleStepClick = (index) => {
    // Optionally only allow clicking up to the next uncompleted step
    setActiveStepIndex(index);
  };

  const progressPercentage = (completedSteps.filter(Boolean).length / steps.length) * 100;

  return (
    <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/40">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center text-violet-light">
            <BookOpen size={20} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="text-sm text-text-muted">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 bg-black/40 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet to-cyan transition-all duration-500 rounded-full" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
            <span className="text-xs font-mono text-text-muted">
              {completedSteps.filter(Boolean).length}/{steps.length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-text-muted">
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 p-4 sm:p-6 bg-black/20">
              
              {fullyCompleted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-xl border border-success/30 bg-success/10 flex items-start gap-4"
                >
                  <div className="mt-1 flex-shrink-0 text-success">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-success">Lesson Completed!</h3>
                    <p className="text-xs text-success/80 mt-1">Excellent work. You have mastered the basics of this module. Feel free to continue experimenting on the canvas.</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {steps.map((step, i) => {
                  const isDone = completedSteps[i];
                  const isActive = i === activeStepIndex && !fullyCompleted;
                  
                  return (
                    <div 
                      key={i}
                      className={clsx(
                        'rounded-xl border transition-all duration-300 overflow-hidden',
                        isActive 
                          ? 'border-violet/40 bg-violet/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]' 
                          : isDone 
                            ? 'border-white/5 bg-white/[0.01]' 
                            : 'border-transparent bg-transparent opacity-60 hover:opacity-100'
                      )}
                    >
                      <button 
                        onClick={() => handleStepClick(i)}
                        className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className={clsx(
                            "flex-shrink-0 transition-colors duration-300",
                            isDone ? "text-success" : isActive ? "text-violet-light" : "text-text-muted"
                          )}>
                            {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </div>
                          <span className={clsx(
                            "text-sm font-medium transition-colors duration-300",
                            isActive ? "text-text-primary" : "text-text-secondary",
                            isDone && "line-through text-text-muted decoration-success/30"
                          )}>
                            {step.title}
                          </span>
                        </div>
                        {!isActive && !isDone && (
                          <ChevronRight size={14} className="text-text-muted/50" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pl-11 pt-1">
                              <div className="prose prose-invert prose-sm text-text-secondary max-w-none">
                                <ReactMarkdown
                                  components={{
                                    code: ({node, inline, className, children, ...props}) => (
                                      <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-light font-mono text-xs" {...props}>
                                        {children}
                                      </code>
                                    )
                                  }}
                                >
                                  {step.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
