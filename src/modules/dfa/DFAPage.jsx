import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, RotateCcw, Download } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AutomataGraph from '@/components/graph/AutomataGraph';
import TraceLog from '@/components/graph/TraceLog';
import StringExplorer from '@/components/graph/StringExplorer';
import SimulationControls from '@/components/graph/SimulationControls';
import LessonPanel from '@/components/layout/LessonPanel';
import MachineGallery from '@/components/layout/MachineGallery';
import useDFAStore, { DFA_EXAMPLES } from '@/store/useDFAStore';
import useAppStore from '@/store/useAppStore';
import MathDisplay from '@/components/ui/MathDisplay';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';

const DFA_LESSONS = [
  {
    title: 'What is a DFA?',
    content: `A **Deterministic Finite Automaton (DFA)** is a model of computation. It reads an input string one symbol at a time and decides whether to **accept** or **reject** it.\n\nFormally, a DFA is a 5-tuple **M = (Q, Σ, δ, q₀, F)** where:\n- **Q** = finite set of states\n- **Σ** = alphabet (set of input symbols)\n- **δ: Q × Σ → Q** = transition function\n- **q₀ ∈ Q** = start state\n- **F ⊆ Q** = set of accept states`,
  },
  {
    title: 'Explore the example machine',
    content: `The machine loaded is the **Binary Divisible by 3** DFA. It recognizes binary strings whose value is divisible by 3.\n\nFor example: \`0\`, \`11\`, \`110\`, \`1001\` are all accepted.\n\nLook at the graph. States move left to right. The **double circle** state (q0) is the accept state. The arrow marker shows the **start state**.`,
  },
  {
    title: 'Run your first simulation',
    content: `Type the string \`110\` in the **Input String** box (this is binary for 6, divisible by 3) and click **Simulate**.\n\nThen click **Step Forward** (▶) to watch the machine transition state-by-state through the string. After all steps, the machine will report **ACCEPTED**.`,
  },
  {
    title: 'Understand the Trace Log',
    content: `The **Simulation Trace** below the controls shows every state transition the DFA made:\n\n\`q0 –[1]→ q1 –[1]→ q0 –[0]→ q0\`  →  **Accepted** ✓\n\nEach row shows: which state the machine was in, what symbol it read, and where it went. This is the δ function in action.`,
  },
  {
    title: 'Explore accepted strings with String Explorer',
    content: `Scroll down to the **String Explorer** panel. It automatically tests many strings against your DFA and shows which are accepted (✓) and rejected (✗).\n\nCan you guess the pattern? Try changing the example from the **Load Example** dropdown to see a different language!`,
  },
];

export default function DFAPage() {
  const store = useDFAStore();
  const {
    nodes, edges, inputString, simulation, speed, selectedExample,
    setInputString, startSimulation, stepForward, stepBackward,
    resetSimulation, loadExample, addState, removeState,
    toggleAccept, setStart, addTransition, removeTransition,
    setSpeed, clearAll,
  } = store;

  const [addStateModal, setAddStateModal] = useState(false);
  const [addTransModal, setAddTransModal] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateAccept, setNewStateAccept] = useState(false);
  const [transSource, setTransSource] = useState('');
  const [transSymbol, setTransSymbol] = useState('');
  const [transTarget, setTransTarget] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const playRef = useRef(null);

  // Auto-play
  useEffect(() => {
    if (isPlaying && simulation && simulation.status !== 'done') {
      playRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, simulation, speed, stepForward]);

  const completeModule = useAppStore(state => state.completeModule);

  useEffect(() => {
    if (simulation?.status === 'done') {
      setIsPlaying(false);
      const isAccept = simulation.steps[simulation.currentStep]?.isAccepting;
      if (isAccept) {
        audio.playSuccess();
        fireConfetti();
        completeModule('/dfa');
      } else {
        audio.playError();
      }
    }
  }, [simulation?.status, simulation?.currentStep, simulation?.steps, completeModule]);

  // Tick sound on step
  useEffect(() => {
    if (simulation?.currentStep > 0 && simulation?.status !== 'done') {
      audio.playTick();
    }
  }, [simulation?.currentStep, simulation?.status]);

  // Load initial example
  useEffect(() => {
    loadExample('binary_div3');
  }, [loadExample]);

  const handleAddState = () => {
    if (newStateName) {
      addState(newStateName, newStateAccept);
      setNewStateName('');
      setNewStateAccept(false);
      setAddStateModal(false);
    }
  };

  const handleAddTransition = () => {
    if (transSource && transSymbol && transTarget) {
      addTransition(transSource, transSymbol, transTarget);
      setTransSymbol('');
      setAddTransModal(false);
    }
  };

  // Determine active states for graph
  const activeStates = new Set();
  let activeEdge = null;
  if (simulation) {
    const step = simulation.steps[simulation.currentStep];
    if (step) {
      if (step.state) activeStates.add(step.state);
      if (step.from && step.state) {
        activeEdge = { source: step.from, target: step.state };
      }
    }
  }

  const simulateDfa = useCallback((str) => {
    const dfa = store.buildDFA();
    if (!dfa) throw new Error("Invalid DFA");
    const steps = [...dfa.simulate(str)];
    return steps[steps.length - 1].accepted;
  }, [store]);

  // Lesson progress tracking: step is complete when the user has done the relevant action
  const lessonCompleted = [
    true, // step 0: always complete — it's reading
    nodes.length > 0, // step 1: machine exists
    simulation !== null, // step 2: ran a simulation
    simulation?.status === 'done', // step 3: finished a simulation
    true, // step 4: always available
  ];

  // Gallery snapshot helpers
  const getSnapshot = useCallback(() => ({
    nodes: nodes,
    edges: edges,
    alphabet: store.alphabet,
  }), [nodes, edges, store.alphabet]);

  const loadSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    store.clearAll();
    // Reconstruct by re-adding nodes and edges
    snapshot.nodes.forEach(n => {
      store.addState(n.id, n.isAccept);
      if (n.isStart) store.setStart(n.id);
    });
    snapshot.edges.forEach(e => {
      store.addTransition(e.source, e.symbol, e.target);
    });
  }, [store]);

  const stateOptions = nodes.map(n => ({ value: n.id, label: n.id }));
  const exampleOptions = Object.entries(DFA_EXAMPLES).map(([key, val]) => ({
    value: key,
    label: val.name,
  }));

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="DFA Simulator"
            subtitle="Build, visualize, and simulate Deterministic Finite Automata"
            badge="Finite Automata"
          />

          {/* Lesson Panel */}
          <LessonPanel
            title="DFA — Guided Lesson"
            description="Learn the theory and interact with the simulator"
            steps={DFA_LESSONS}
            completedSteps={lessonCompleted}
            onFinish={() => completeModule('/dfa')}
          />

          {/* Formal definition */}
          <Card className="mb-6">
            <div className="text-sm text-text-secondary">
              <MathDisplay
                math="M = (Q, \Sigma, \delta, q_0, F)"
                block
              />
              <p className="text-xs text-text-muted mt-2 text-center">
                A DFA is a 5-tuple: states Q, alphabet Σ, transition function δ, start state q₀, and accept states F.
              </p>
            </div>
          </Card>

          <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Graph Canvas — Main Area */}
            <div className="flex-1 min-w-0 space-y-4">
              <AutomataGraph
                nodes={nodes}
                edges={edges}
                activeStates={activeStates}
                activeEdge={activeEdge}
                onNodeClick={(id) => store.selectNode(id)}
                height="550px"
                className="w-full"
              />

              {/* Simulation input */}
              <Card>
                <div className="flex gap-3 items-end mb-4">
                  <div className="flex-1">
                    <Input
                      label="Input String"
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="e.g., 0110"
                      className="font-mono"
                    />
                  </div>
                  <Button onClick={() => { resetSimulation(); startSimulation(); setIsPlaying(false); }}>
                    <Play size={14} />
                    Simulate
                  </Button>
                </div>

                <SimulationControls
                  simulation={simulation}
                  speed={speed}
                  isPlaying={isPlaying}
                  onStepForward={stepForward}
                  onStepBackward={stepBackward}
                  onReset={resetSimulation}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onSpeedChange={setSpeed}
                />
              </Card>

              {/* Trace Log */}
              <TraceLog simulation={simulation} />

              {/* String Explorer */}
              <StringExplorer simulateFn={simulateDfa} alphabet={store.alphabet} />
            </div>

            {/* Control Panel — Right Sidebar */}
            <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 space-y-4">
              {/* Example selector */}
              <Card>
                <Select
                  label="Load Example"
                  value={selectedExample}
                  onChange={(val) => loadExample(val)}
                  options={exampleOptions}
                />
                {DFA_EXAMPLES[selectedExample] && (
                  <p className="text-xs text-text-muted mt-2">
                    {DFA_EXAMPLES[selectedExample].description}
                  </p>
                )}
              </Card>

              {/* State management */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">States</h3>
                  <Button variant="ghost" size="sm" onClick={() => setAddStateModal(true)}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nodes.map(n => (
                    <div key={n.id} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-sm">
                      <span className="font-mono text-text-primary">{n.id}</span>
                      {n.isStart && <Badge variant="cyan">S</Badge>}
                      {n.isAccept && <Badge variant="success">F</Badge>}
                      <button
                        onClick={() => toggleAccept(n.id)}
                        className="text-text-muted hover:text-flora-light opacity-0 group-hover:opacity-100 text-xs transition-all"
                        title="Toggle accept"
                      >
                        ◉
                      </button>
                      <button
                        onClick={() => setStart(n.id)}
                        className="text-text-muted hover:text-cyan-light opacity-0 group-hover:opacity-100 text-xs transition-all"
                        title="Set as start"
                      >
                        →
                      </button>
                      <button
                        onClick={() => removeState(n.id)}
                        className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Add transition */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Transitions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setAddTransModal(true)}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {edges.map(e => (
                    <div key={e.id} className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/5 text-xs font-mono">
                      <span className="text-text-secondary">
                        δ(<span className="text-flora-light">{e.source}</span>,
                        <span className="text-emerald-light">{e.symbol}</span>) =
                        <span className="text-flora-light"> {e.target}</span>
                      </span>
                      <button
                        onClick={() => removeTransition(e.id)}
                        className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Transition Table */}
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transition Table</h3>
                <div className="overflow-x-auto">
                  <TransitionTable nodes={nodes} edges={edges} />
                </div>
              </Card>

              {/* Machine Gallery */}
              <MachineGallery
                type="dfa"
                onGetSnapshot={getSnapshot}
                onLoadSnapshot={loadSnapshot}
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={clearAll} className="flex-1">
                  <Trash2 size={14} /> Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PageWrapper>

      {/* Add State Modal */}
      <Modal open={addStateModal} onClose={() => setAddStateModal(false)} title="Add State">
        <div className="space-y-4">
          <Input
            label="State Name"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            placeholder="e.g., q3"
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={newStateAccept}
              onChange={(e) => setNewStateAccept(e.target.checked)}
              className="rounded border-border"
            />
            Accept state
          </label>
          <Button onClick={handleAddState} className="w-full">Add State</Button>
        </div>
      </Modal>

      {/* Add Transition Modal */}
      <Modal open={addTransModal} onClose={() => setAddTransModal(false)} title="Add Transition">
        <div className="space-y-4">
          <Select
            label="From State"
            value={transSource}
            onChange={setTransSource}
            options={[{ value: '', label: 'Select...' }, ...stateOptions]}
          />
          <Input
            label="Symbol"
            value={transSymbol}
            onChange={(e) => setTransSymbol(e.target.value)}
            placeholder="e.g., 0"
          />
          <Select
            label="To State"
            value={transTarget}
            onChange={setTransTarget}
            options={[{ value: '', label: 'Select...' }, ...stateOptions]}
          />
          <Button onClick={handleAddTransition} className="w-full">Add Transition</Button>
        </div>
      </Modal>
    </>
  );
}

function TransitionTable({ nodes, edges }) {
  if (nodes.length === 0) return <p className="text-xs text-text-muted">No states defined.</p>;

  const symbols = [...new Set(edges.map(e => e.symbol))].sort();
  if (symbols.length === 0) return <p className="text-xs text-text-muted">No transitions defined.</p>;

  const transMap = {};
  for (const e of edges) {
    const key = `${e.source},${e.symbol}`;
    transMap[key] = e.target;
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left py-1.5 px-2 text-text-muted font-medium">State</th>
          {symbols.map(s => (
            <th key={s} className="text-center py-1.5 px-2 text-emerald-light font-mono">{s}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {nodes.map(n => (
          <tr key={n.id} className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="py-1.5 px-2 font-mono text-text-primary">
              {n.isStart && <span className="text-emerald-light mr-1">→</span>}
              {n.isAccept && <span className="text-success mr-1">*</span>}
              {n.id}
            </td>
            {symbols.map(s => (
              <td key={s} className="text-center py-1.5 px-2 font-mono text-text-secondary">
                {transMap[`${n.id},${s}`] || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

