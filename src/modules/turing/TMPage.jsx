import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Slider from '@/components/ui/Slider';
import MathDisplay from '@/components/ui/MathDisplay';
import TMTape3D from '@/components/three/TMTape3D';
import TraceLog from '@/components/graph/TraceLog';
import LessonPanel from '@/components/layout/LessonPanel';
import useTMStore, { TM_EXAMPLES } from '@/store/useTMStore';
import useAppStore from '@/store/useAppStore';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';

const TM_LESSONS = [
  {
    title: 'What is a Turing Machine?',
    content: 'A **Turing Machine (TM)** is the most powerful theoretical model of computation. Unlike a DFA, it has an infinite **read-write tape**, and its read head can move both left and right.\n\nFormally, **M = (Q, \u03a3, \u0393, \u03b4, q\u2080, q_accept, q_reject)** where:\n- **\u0393** = tape alphabet (larger than input alphabet)\n- **\u03b4: Q \u00d7 \u0393 \u2192 Q \u00d7 \u0393 \u00d7 {L, R}** = transition (read, write, move)',
  },
  {
    title: 'Observe the 3D Tape',
    content: 'The **3D Tape** visualization shows you the actual tape at each step.\n\n- The **pink highlighted cell** is the current read/write head position.\n- Blank cells (\_) represent unwritten positions.\n- The head moves **L** (left) or **R** (right) after each operation.\n\nThe TM\'s power comes from this two-way infinite tape!',
  },
  {
    title: 'Run the Palindrome Checker',
    content: 'The default machine is a **Palindrome Checker**. It accepts strings over {a, b} that read the same forwards and backwards.\n\nType `abba` or `aba` in the input box and click **Run**. Then use the Playback controls to step through the computation one step at a time.',
  },
  {
    title: 'Read the Transition Table',
    content: 'The **Transition Function** table shows every rule. Each row is a tuple **(state, read) \u2192 (write, direction, next state)**.\n\nThe currently active rule is highlighted in **violet** as the simulation runs. This is the \u03b4 function in action!',
  },
  {
    title: 'Church-Turing Thesis',
    content: 'The **Church-Turing Thesis** states that anything computable by any algorithm can be computed by a Turing Machine.\n\nTry the **a\u207fb\u207f Recognizer** example \u2014 this language cannot be recognized by any DFA or NFA, but the Turing Machine handles it easily!',
  },
];

export default function TMPage() {
  const {
    selectedExample, inputString, simulation, speed, isPlaying,
    setInputString, setSpeed, setSelectedExample,
    startSimulation, stepForward, stepBackward, setPlaying, resetSimulation,
  } = useTMStore();

  const completeModule = useAppStore(state => state.completeModule);
  const playRef = useRef(null);

  useEffect(() => {
    if (isPlaying && simulation && simulation.status !== 'done') {
      playRef.current = setInterval(stepForward, speed);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, simulation, speed, stepForward]);

  useEffect(() => {
    if (simulation?.status === 'done') {
      setPlaying(false);
      const isAccept = simulation.steps[simulation.currentStep]?.isAccepting;
      if (isAccept) {
        audio.playSuccess();
        fireConfetti();
        completeModule('/turing');
      } else {
        audio.playError();
      }
    }
  }, [simulation?.status, simulation?.currentStep, simulation?.steps, setPlaying, completeModule]);

  useEffect(() => {
    if (simulation?.currentStep > 0 && simulation?.status !== 'done') {
      audio.playTick();
    }
  }, [simulation?.currentStep, simulation?.status]);

  const example = TM_EXAMPLES[selectedExample];
  const step = simulation?.steps?.[simulation.currentStep];

  const lessonCompleted = [
    true,
    true,
    simulation !== null,
    simulation?.status === 'done',
    true,
  ];

  const exampleOptions = Object.entries(TM_EXAMPLES).map(([key, val]) => ({
    value: key,
    label: val.name,
  }));

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="Turing Machine"
            subtitle="Watch the infinite tape dance as your TM computes"
            badge="Computability"
          />

          <LessonPanel
            title="Turing Machine \u2014 Guided Lesson"
            description="Discover the most powerful model of computation"
            steps={TM_LESSONS}
            completedSteps={lessonCompleted}
            onFinish={() => completeModule('/turing')}
          />

          <Card className="mb-6">
            <MathDisplay math="M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})" block />
            <p className="text-xs text-text-muted text-center">
              δ: Q × Γ → Q × Γ × {'{'}L, R{'}'} — read symbol, write symbol, move head
            </p>
          </Card>

          {/* Tape Visualization */}
          <Card className="mb-6 p-0 overflow-hidden relative">
            <h3 className="absolute top-4 left-4 z-10 text-sm font-semibold text-text-primary bg-surface/80 px-3 py-1 rounded-full backdrop-blur-md">3D Tape</h3>
            <TMTape3D
              tape={step?.tape || new Map(inputString.split('').map((c, i) => [i, c]))}
              headPosition={step?.head ?? 0}
              blankSymbol={example?.blank || '_'}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-text-muted">
                  State: <span className="text-violet-light font-mono">{step?.state ?? example?.start ?? '—'}</span>
                </span>
                <span className="text-text-muted">
                  Head: <span className="text-cyan-light font-mono">{step?.head ?? 0}</span>
                </span>
                <span className="text-text-muted">
                  Steps: <span className="text-text-primary font-mono">{step?.stepCount ?? 0}</span>
                </span>
              </div>
              {step?.phase && step.phase !== 'compute' && (
                <Badge variant={step.phase === 'accepted' ? 'success' : step.phase === 'rejected' ? 'danger' : 'warning'}>
                  {step.phase.toUpperCase()}
                </Badge>
              )}
            </div>
          </Card>

          <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full">
            {/* Controls */}
            <Card className="flex-1 w-full lg:max-w-sm">
              <Select
                label="Example Machine"
                value={selectedExample}
                onChange={(val) => { setSelectedExample(val); resetSimulation(); }}
                options={exampleOptions}
              />
              {example && (
                <p className="text-xs text-text-muted mt-2">{example.description}</p>
              )}

              <div className="mt-4">
                <Input
                  label="Input String"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  placeholder={selectedExample === 'palindrome' ? 'abba' : 'aabb'}
                  className="font-mono"
                />
              </div>

              <Button onClick={() => { resetSimulation(); startSimulation(); }} className="w-full mt-4" size="lg">
                <Play size={14} /> Run
              </Button>
            </Card>

            {/* Playback Controls */}
            <Card className="flex-1 w-full lg:max-w-sm">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Playback</h3>

              {simulation && (
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-violet to-cyan transition-all duration-300 rounded-full"
                    style={{ width: `${simulation.steps.length > 1 ? (simulation.currentStep / (simulation.steps.length - 1)) * 100 : 0}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-4">
                <Button variant="icon" onClick={resetSimulation} disabled={!simulation}>
                  <RotateCcw size={16} />
                </Button>
                <Button variant="icon" onClick={stepBackward} disabled={!simulation || simulation.currentStep <= 0}>
                  <SkipBack size={16} />
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setPlaying(!isPlaying)}
                  disabled={!simulation || simulation.status === 'done'}
                  className="px-5"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button variant="icon" onClick={stepForward} disabled={!simulation || simulation.status === 'done'}>
                  <SkipForward size={16} />
                </Button>
               </div>

              <Slider
                label="Speed (ms)"
                value={speed}
                onValueChange={setSpeed}
                min={50}
                max={2000}
                step={50}
              />

              {simulation && (
                <p className="text-xs text-text-muted text-center mt-3 font-mono">
                  Step {simulation.currentStep} / {simulation.steps.length - 1}
                </p>
              )}
            </Card>

            {/* Transition Table */}
            <Card className="flex-1 w-full lg:max-w-md">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Transition Function</h3>
              <div className="max-h-64 overflow-y-auto">
                {example && (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 px-1.5 text-text-muted">State</th>
                        <th className="text-center py-1 px-1.5 text-text-muted">Read</th>
                        <th className="text-center py-1 px-1.5 text-text-muted">Write</th>
                        <th className="text-center py-1 px-1.5 text-text-muted">Dir</th>
                        <th className="text-left py-1 px-1.5 text-text-muted">Next</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(example.transitions).map(([key, val]) => {
                        const [state, sym] = key.split(',');
                        const isActive = step?.state === state && (step?.tape?.get(step?.head) ?? example.blank) === sym;
                        return (
                          <tr key={key} className={`border-b border-white/5 ${isActive ? 'bg-violet/10' : ''}`}>
                            <td className="py-1 px-1.5 font-mono text-violet-light">{state}</td>
                            <td className="py-1 px-1.5 font-mono text-center text-cyan-light">{sym}</td>
                            <td className="py-1 px-1.5 font-mono text-center text-text-primary">{val.write}</td>
                            <td className="py-1 px-1.5 font-mono text-center text-text-secondary">{val.direction}</td>
                            <td className="py-1 px-1.5 font-mono text-violet-light">{val.nextState}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>

          {/* Trace Log */}
          <TraceLog simulation={simulation} className="mt-6" />
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


