import { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import AutomataGraph from '@/components/graph/AutomataGraph';
import MathDisplay from '@/components/ui/MathDisplay';
import StackViz from '@/components/viz/StackViz';
import InputQueue from '@/components/viz/InputQueue';
import usePDAStore from '@/store/usePDAStore';
import useAppStore from '@/store/useAppStore';
import AITutor from '@/components/tutor/AITutor';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';
import { Play } from 'lucide-react';

export default function PDAPage() {
  const { nodes, edges, inputString, cfgText, simulation,
    setInputString, setCfgText, loadExample, resetSimulation } = usePDAStore();
  
  const completeModule = useAppStore(state => state.completeModule);

  // Simulate a simple push/pop stack to demonstrate the concept
  // We derive the stack from the input string for the aⁿbⁿ PDA example
  const [simStep, setSimStep] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const inputChars = inputString.split('');
  const aCount = inputChars.filter(c => c === 'a').length;
  const bRead = Math.min(simStep > aCount ? simStep - aCount : 0, aCount);
  const pdaStack = simRunning
    ? ['$', ...Array(Math.max(0, aCount - bRead)).fill('a')]
    : ['$'];
  const pdaHead = simRunning ? Math.min(simStep, inputChars.length) : 0;

  useEffect(() => { loadExample(); }, [loadExample]);

  const systemContext = `You are a helpful AI Tutor for AutomataVerse. The user is currently in the PDA (Pushdown Automaton) module.
Current States: ${nodes.map(n => `${n.id}${n.isStart ? ' (Start)' : ''}${n.isAccept ? ' (Accept)' : ''}`).join(', ')}
Current CFG: ${cfgText}
You can answer questions, explain context-free languages, or help write a Pushdown Automaton. Be concise.`;

  const toolsContext = {
    // PDA doesn't have exposed dynamic additions in store yet, but we will pass basic ones
    clearAll: usePDAStore.getState().clearAll
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="Pushdown Automata"
            subtitle="Simulate PDAs with animated stack operations"
            badge="Context-Free"

          />

          <Card className="mb-6">
            <MathDisplay math="P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)" block />
            <p className="text-xs text-text-muted text-center">
              A PDA extends a finite automaton with a stack memory (Γ is the stack alphabet, Z₀ is the initial stack symbol).
            </p>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* PDA Graph */}
            <div className="lg:col-span-2 space-y-4">
              <AutomataGraph
                nodes={nodes}
                edges={edges}
                height="400px"
              />

              {/* Stack Visualization */}
              <Card>
                <div className="flex items-start gap-6 flex-wrap">
                  <div className="flex-1 min-w-[120px]">
                    <StackViz
                      stack={pdaStack}
                      label="PDA Stack"
                      accentColor="violet"
                    />
                  </div>
                  {simRunning && (
                    <div className="flex-1">
                      <InputQueue
                        inputString={inputString}
                        headIndex={pdaHead}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">CFG Input</h3>
                <textarea
                  value={cfgText}
                  onChange={(e) => setCfgText(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl text-sm font-mono bg-void border border-border text-text-primary resize-none focus:outline-none focus:border-violet"
                  placeholder="S -> aSb | ε"
                />
                <p className="text-xs text-text-muted mt-1">Format: Variable → production | alternative</p>
              </Card>

              <Card>
                <div className="flex gap-2 items-end mb-3">
                  <div className="flex-1">
                    <Input
                      label="Input String"
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="aabb"
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => {
                  setSimStep(0);
                  setSimRunning(true);
                  // step forward through the string every 600ms
                  const total = inputString.length;
                  let step = 0;
                  const interval = setInterval(() => {
                    step++;
                    setSimStep(step);
                    if (step > total) {
                      clearInterval(interval);
                      const aCount = inputString.split('').filter(c => c === 'a').length;
                      const bCount = inputString.split('').filter(c => c === 'b').length;
                      if (aCount === bCount && aCount > 0) {
                        completeModule('/pda');
                      }
                    }
                  }, 600);
                }}>
                  <Play size={14} /> Simulate PDA
                </Button>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transitions</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {edges.map((e, i) => (
                    <div key={i} className="text-xs font-mono text-text-secondary px-2 py-1 rounded bg-white/[0.02]">
                      {e.label}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Key Concepts</h3>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex gap-2">
                    <Badge variant="cyan">Push</Badge>
                    <span>Add symbol to stack top</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="warning">Pop</Badge>
                    <span>Remove symbol from stack top</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="default">ε</Badge>
                    <span>Epsilon (no input consumed)</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </PageWrapper>
      <AITutor systemContext={systemContext} toolsContext={toolsContext} />
    </>
  );
}


