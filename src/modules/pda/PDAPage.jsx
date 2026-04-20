import { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
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
  const {
    nodes, edges, inputString, cfgText, simulation,
    setInputString, setCfgText, loadExample, resetSimulation,
    addState, addTransition, removeState, removeTransition, updateTransition,
    toggleAccept, setStart, clearAll,
  } = usePDAStore();

  const completeModule = useAppStore(state => state.completeModule);

  // Edit transition modal
  const [editTransModal, setEditTransModal] = useState(false);
  const [editEdgeIds, setEditEdgeIds] = useState([]);
  const [editSymbol, setEditSymbol] = useState('');

  // Animated PDA stack sim
  const [simStep, setSimStep] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const inputChars = inputString.split('');
  const aCount = inputChars.filter(c => c === 'a').length;
  const bRead = Math.min(simStep > aCount ? simStep - aCount : 0, aCount);
  const pdaStack = simRunning ? ['$', ...Array(Math.max(0, aCount - bRead)).fill('a')] : ['$'];
  const pdaHead = simRunning ? Math.min(simStep, inputChars.length) : 0;

  useEffect(() => { loadExample(); }, [loadExample]);

  const systemContext = `You are a helpful AI Tutor for AutomataVerse. The user is currently in the PDA (Pushdown Automaton) module.
Current States: ${nodes.map(n => `${n.id}${n.isStart ? ' (Start)' : ''}${n.isAccept ? ' (Accept)' : ''}`).join(', ')}
Current Transitions: ${edges.map(e => `${e.source} --[${e.symbol}]--> ${e.target}`).join('; ')}
Current CFG: ${cfgText}

IMPORTANT — Edge label format for PDA is: "read, pop → push"
Examples: "a, ε → a" (read a, don't pop, push a) | "ε, $ → ε" (epsilon, pop $, push nothing) | "b, a → ε" (read b, pop a)
Always use this exact format when calling addTransition.

You can answer questions, explain context-free languages, or build/modify the PDA graph using tool calls. Be concise.`;

  const toolsContext = {
    addState,
    addTransition,
    clearAll,
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="Pushdown Automata"
            subtitle="Build and simulate PDAs with animated stack operations"
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
                onBackgroundDoubleClick={(pos) => addState(null, false, pos)}
                onConnectEdge={(source, target) => addTransition(source, '_', target)}
                onEdgeClick={({ edgeIds, currentLabel }) => {
                  setEditEdgeIds(edgeIds);
                  setEditSymbol(currentLabel === '?' ? '' : currentLabel);
                  setEditTransModal(true);
                }}
              />

              {/* Stack + Queue Visualization */}
              <Card>
                <div className="flex items-start gap-6 flex-wrap">
                  <div className="flex-1 min-w-[120px]">
                    <StackViz stack={pdaStack} label="PDA Stack" accentColor="violet" />
                  </div>
                  {simRunning && (
                    <div className="flex-1">
                      <InputQueue inputString={inputString} headIndex={pdaHead} />
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
                  const total = inputString.length;
                  let step = 0;
                  const interval = setInterval(() => {
                    step++;
                    setSimStep(step);
                    if (step > total) {
                      clearInterval(interval);
                      const aC = inputString.split('').filter(c => c === 'a').length;
                      const bC = inputString.split('').filter(c => c === 'b').length;
                      if (aC === bC && aC > 0) { audio.playSuccess(); fireConfetti(); completeModule('/pda'); }
                      else audio.playError();
                    }
                  }, 600);
                }}>
                  <Play size={14} /> Simulate PDA
                </Button>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transitions</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {edges.length === 0 && (
                    <p className="text-xs text-text-muted italic">Right-drag to add transitions. Click edges to edit.</p>
                  )}
                  {edges.map((e, i) => (
                    <div key={e.id || i} className="text-xs font-mono text-text-secondary px-2 py-1 rounded bg-white/[0.02] flex items-center justify-between">
                      <span>{e.source} → {e.target}</span>
                      <span className="text-violet-light">{e.symbol || '?'}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">Graph Controls</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={loadExample}>Load Example</Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={clearAll}>Clear All</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Key Concepts</h3>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex gap-2"><Badge variant="cyan">Push</Badge><span>Add symbol to stack top</span></li>
                  <li className="flex gap-2"><Badge variant="warning">Pop</Badge><span>Remove symbol from stack top</span></li>
                  <li className="flex gap-2"><Badge variant="default">ε</Badge><span>Epsilon (no input consumed)</span></li>
                  <li className="text-text-muted pt-2 border-t border-border">Edge format: <code className="text-violet-light">read, pop → push</code></li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </PageWrapper>

      {/* Edit Transition Modal */}
      <Modal open={editTransModal} onClose={() => setEditTransModal(false)} title="Edit PDA Transition">
        <div className="space-y-4">
          <p className="text-xs text-text-muted">Format: <code className="text-violet-light">read, pop → push</code><br/>e.g. <code>a, ε → a</code> or <code>ε, $ → ε</code></p>
          <Input
            label="Transition Label"
            value={editSymbol}
            onChange={(e) => setEditSymbol(e.target.value)}
            placeholder="a, ε → a"
            autoFocus
          />
          <Button
            onClick={() => {
              if (editSymbol.trim()) editEdgeIds.forEach(id => updateTransition(id, editSymbol.trim()));
              setEditTransModal(false);
            }}
            className="w-full"
          >
            Save
          </Button>
          <Button
            variant="danger"
            onClick={() => { editEdgeIds.forEach(id => removeTransition(id)); setEditTransModal(false); }}
            className="w-full"
          >
            Delete Transition(s)
          </Button>
        </div>
      </Modal>

      <AITutor systemContext={systemContext} toolsContext={toolsContext} />
    </>
  );
}
