import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Trash2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import AutomataGraph from '@/components/graph/AutomataGraph';
import TraceLog from '@/components/graph/TraceLog';
import StringExplorer from '@/components/graph/StringExplorer';
import SimulationControls from '@/components/graph/SimulationControls';
import MathDisplay from '@/components/ui/MathDisplay';
import LessonPanel from '@/components/layout/LessonPanel';
import MachineGallery from '@/components/layout/MachineGallery';
import useAppStore from '@/store/useAppStore';
import useNFAStore from '@/store/useNFAStore';
import { nfaToDfa, setKey } from '@/lib/subset-construction';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';

const NFA_LESSONS = [
  {
    title: 'NFA vs DFA — What is Non-determinism?',
    content: `A **Non-deterministic Finite Automaton (NFA)** is like a DFA but it can *guess*. From a single state, reading a symbol, it may transition to **multiple states simultaneously** (or even spontaneously via **ε (epsilon)** transitions without reading anything).\n\nFormally: **δ: Q × (Σ ∪ {ε}) → P(Q)** (a *set* of states, not just one).\n\nAn NFA accepts a string if **at least one** computation path leads to an accept state.`,
  },
  {
    title: 'Explore the NFA',
    content: `The NFA canvas shows the same-style graph as the DFA. Look for states with **multiple outgoing edges** for the same symbol — that is non-determinism.\n\nIf there is an edge labeled **ε**, that is a free transition (epsilon move) that happens without consuming any input.`,
  },
  {
    title: 'Run an NFA simulation',
    content: `Type a string in the input box and click **Simulate** to run the NFA. The simulation tracks **all active states** at once, shown highlighted in the graph.\n\nThe Trace Log shows the set of active states at each step, reflecting the branching computation.`,
  },
  {
    title: 'Convert to DFA with Subset Construction',
    content: `Every NFA has an equivalent DFA! The conversion algorithm is called **Subset Construction** (or the Powerset construction).\n\nClick the **"Convert to DFA"** button. Each state in the resulting DFA represents a *set* of NFA states. The state mapping table shows this correspondence.`,
  },
  {
    title: 'Compare NFA and DFA results',
    content: `Use the **Dual Simulation** panel to test a string against both the NFA and its equivalent DFA simultaneously.\n\nBoth should always give the **same result** (accept or reject) — this is the fundamental theorem proven by the Subset Construction!`,
  },
];

export default function NFAPage() {
  const store = useNFAStore();
  const completeModule = useAppStore(state => state.completeModule);
  
  const { nodes, edges, inputString, simulation, speed,
    setInputString, startSimulation, stepForward, stepBackward,
    resetSimulation, loadExample, addState, addTransition,
    removeState, removeTransition, toggleAccept, setStart,
    setSpeed, clearAll, buildNFA,
  } = store;

  const [isPlaying, setIsPlaying] = useState(false);
  const [subsetResult, setSubsetResult] = useState(null);
  const [showSubset, setShowSubset] = useState(false);
  const [addStateModal, setAddStateModal] = useState(false);
  const [addTransModal, setAddTransModal] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateAccept, setNewStateAccept] = useState(false);
  const [transSource, setTransSource] = useState('');
  const [transSymbol, setTransSymbol] = useState('');
  const [transTarget, setTransTarget] = useState('');
  const playRef = useRef(null);

  // For Dual Simulation feature
  const [compareStr, setCompareStr] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    loadExample();
  }, [loadExample]);

  useEffect(() => {
    if (isPlaying && simulation && simulation.status !== 'done') {
      playRef.current = setInterval(stepForward, speed);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, simulation, speed, stepForward]);

  useEffect(() => {
    if (simulation?.status === 'done') {
      setIsPlaying(false);
      const isAccept = simulation.steps[simulation.currentStep]?.isAccepting;
      if (isAccept) {
        audio.playSuccess();
        fireConfetti();
        completeModule('/nfa');
      } else {
        audio.playError();
      }
    }
  }, [simulation?.status, simulation?.currentStep, simulation?.steps, completeModule]);

  useEffect(() => {
    if (simulation?.currentStep > 0 && simulation?.status !== 'done') {
      audio.playTick();
    }
  }, [simulation?.currentStep, simulation?.status]);

  const runSubsetConstruction = () => {
    const nfa = buildNFA();
    if (!nfa) return;
    const result = nfaToDfa(nfa);
    setSubsetResult(result);
    setCompareResult(null); // Reset comparison
    setShowSubset(true);
  };

  const runDualSimulation = () => {
    if (!subsetResult) return;
    const nfa = buildNFA();
    
    // NFA result
    const nfaSteps = [...nfa.simulate(compareStr)];
    const nfaAccepted = nfaSteps[nfaSteps.length - 1].accepted;
    
    // DFA result (quick custom traversal over subsetResult graph)
    let stateStr = setKey(Array.from(subsetResult.dfaStates.values())[0]?.states || []);
    let dfaPath = [stateStr];
    for (const char of compareStr) {
      if(char === 'ε') continue;
      const tKey = `${stateStr},${char}`;
      const nextStr = subsetResult.transitions.get(tKey);
      if (!nextStr) { stateStr = null; break; }
      stateStr = nextStr;
      dfaPath.push(stateStr);
    }
    const dfaAccepted = stateStr ? !!subsetResult.dfaStates.get(stateStr)?.isAccept : false;

    setCompareResult({ nfa: nfaAccepted, dfa: dfaAccepted, nfaSteps, dfaPath });
  };

  const activeStates = new Set();
  if (simulation) {
    const step = simulation.steps[simulation.currentStep];
    if (step?.states) {
      for (const s of step.states) activeStates.add(s);
    }
  }

  const stateOptions = nodes.map(n => ({ value: n.id, label: n.id }));

  const simulateNfa = useCallback((str) => {
    const nfa = buildNFA();
    if (!nfa) throw new Error("Invalid NFA");
    const steps = [...nfa.simulate(str)];
    return steps[steps.length - 1].accepted;
  }, [buildNFA]);

  // Lesson completion tracking
  const lessonCompleted = [
    true, // Step 0: reading
    nodes.length > 0, // Step 1: machine is visible
    simulation !== null, // Step 2: ran simulation
    subsetResult !== null, // Step 3: did subset construction
    compareResult !== null, // Step 4: ran dual simulation
  ];

  // Snapshot helpers
  const getSnapshot = useCallback(() => ({
    nodes,
    edges,
  }), [nodes, edges]);

  const loadSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    clearAll();
    snapshot.nodes.forEach(n => {
      addState(n.id, n.isAccept);
      if (n.isStart) setStart(n.id);
    });
    snapshot.edges.forEach(e => {
      addTransition(e.source, e.symbol, e.target);
    });
  }, [clearAll, addState, setStart, addTransition]);

  // Build DFA nodes/edges from subset result
  const dfaNodes = [];
  const dfaEdges = [];
  if (subsetResult) {
    for (const [key, data] of subsetResult.dfaStates) {
      dfaNodes.push({
        id: key,
        label: `{${key}}`,
        isStart: key === setKey(Array.from(subsetResult.dfaStates.values())[0]?.states || []),
        isAccept: data.isAccept,
        position: { x: 100 + dfaNodes.length * 180, y: 200 }
      });
    }
    let edgeId = 0;
    for (const [transKey, target] of subsetResult.transitions) {
      const [source, symbol] = transKey.split(',');
      dfaEdges.push({ id: `de${edgeId++}`, source, target, symbol });
    }
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="NFA & Subset Construction"
            subtitle="Build NFAs and watch them transform into equivalent DFAs"
            badge="Non-determinism"
          />

          {/* Lesson Panel */}
          <LessonPanel
            title="NFA — Guided Lesson"
            description="Understand non-determinism and the power of subset construction"
            steps={NFA_LESSONS}
            completedSteps={lessonCompleted}
            onFinish={() => completeModule('/nfa')}
          />

          <Card className="mb-6">
            <MathDisplay math="N = (Q, \Sigma, \delta, q_0, F)" block />
            <p className="text-xs text-text-muted text-center">
              An NFA's transition function δ maps to sets of states: δ: Q × (Σ ∪ {'ε'}) → P(Q)
            </p>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* NFA Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-display text-text-primary flex items-center gap-2">
                <Badge variant="cyan">NFA</Badge> Non-deterministic Automaton
              </h3>
              <AutomataGraph
                nodes={nodes}
                edges={edges}
                activeStates={activeStates}
                height="350px"
              />

              <Card>
                <div className="flex gap-3 items-end mb-4">
                  <div className="flex-1">
                    <Input
                      label="Input String"
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="e.g., aabb"
                      className="font-mono"
                    />
                  </div>
                  <Button onClick={() => { resetSimulation(); startSimulation(); }}>
                    <Play size={14} /> Simulate
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
              <StringExplorer simulateFn={simulateNfa} alphabet={store.alphabet || ['0', '1']} />

              {/* State/Transition management */}
              <Card>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">States & Transitions</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAddStateModal(true)}>
                      <Plus size={12} /> State
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAddTransModal(true)}>
                      <Plus size={12} /> Trans
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {nodes.map(n => (
                    <span key={n.id} className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 border border-white/10 text-text-primary">
                      {n.isStart && '→'}{n.id}{n.isAccept && '*'}
                    </span>
                  ))}
                </div>
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {edges.map(e => (
                    <div key={e.id} className="group flex justify-between text-xs font-mono text-text-secondary px-1 hover:bg-white/5 rounded">
                      <span>δ({e.source}, {e.symbol}) ∋ {e.target}</span>
                      <button onClick={() => removeTransition(e.id)} className="opacity-0 group-hover:opacity-100 text-danger">×</button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={loadExample}>Load (a|b)*abb</Button>
                <Button variant="danger" size="sm" onClick={clearAll}><Trash2 size={12}/> Clear</Button>
              </div>
            </div>

            {/* Subset Construction Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-display text-text-primary flex items-center gap-2">
                <Badge variant="default">DFA</Badge> Subset Construction Result
              </h3>

              <Card className="text-center">
                <Button onClick={runSubsetConstruction} size="lg" className="w-full">
                  Run Subset Construction
                </Button>
                <p className="text-xs text-text-muted mt-2">
                  Converts the NFA above into an equivalent DFA
                </p>
              </Card>

              {showSubset && subsetResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <AutomataGraph
                    nodes={dfaNodes}
                    edges={dfaEdges}
                    height="350px"
                  />

                  {/* Dual Simulation Comparison Panel */}
                  <Card className="mt-4 border border-violet-500/30 bg-violet-500/5">
                    <h4 className="text-sm font-semibold text-violet-300 mb-3 flex items-center gap-2">
                       <Play size={14} /> Compare: NFA vs DFA Equivalent
                    </h4>
                    <div className="flex gap-2 items-end mb-3">
                      <div className="flex-1">
                        <Input 
                           placeholder="Type a string to test..."
                           value={compareStr}
                           onChange={e => setCompareStr(e.target.value)}
                           className="font-mono text-sm"
                        />
                      </div>
                      <Button onClick={runDualSimulation}>Run Both</Button>
                    </div>

                    {compareResult && (
                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                        <div className="flex flex-col gap-1">
                           <span className="text-text-muted font-sans font-semibold mb-1 border-b border-white/10 pb-1">Original NFA</span>
                           <div className={`p-2 rounded text-center font-bold ${compareResult.nfa ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                             {compareResult.nfa ? '✓ ACCEPTED' : '✗ REJECTED'}
                           </div>
                           <div className="text-[10px] text-text-muted mt-1 leading-tight max-h-20 overflow-y-auto pr-1">
                              {compareResult.nfaSteps.length} computation branch(es) tested.
                           </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-text-muted font-sans font-semibold mb-1 border-b border-white/10 pb-1">Equivalent DFA</span>
                           <div className={`p-2 rounded text-center font-bold ${compareResult.dfa ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                             {compareResult.dfa ? '✓ ACCEPTED' : '✗ REJECTED'}
                           </div>
                           <div className="text-[10px] text-text-muted mt-1 leading-tight max-h-20 overflow-y-auto pr-1">
                              Path: {compareResult.dfaPath.join(' → ') || 'Rejected'}
                           </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* DFA States mapping */}
                  <Card className="mt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">State Mapping</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1.5 px-2 text-text-muted">DFA State</th>
                            <th className="text-left py-1.5 px-2 text-text-muted">NFA States</th>
                            <th className="text-center py-1.5 px-2 text-text-muted">Accept?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...subsetResult.dfaStates.entries()].map(([key, data]) => (
                            <tr key={key} className="border-b border-white/5">
                              <td className="py-1.5 px-2 font-mono text-violet-light">{key}</td>
                              <td className="py-1.5 px-2 font-mono text-text-secondary">
                                {'{' + [...data.states].join(', ') + '}'}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                {data.isAccept && <Badge variant="success">✓</Badge>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Construction Steps */}
                  <Card className="mt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Construction Steps</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {subsetResult.steps.map((step, i) => (
                        <div key={i} className="text-xs font-mono text-text-secondary px-2 py-1 rounded bg-white/[0.02]">
                          {step.type === 'PROCESS_SET'
                            ? `Process: {${[...step.set].join(',')}}`
                            : `Move({${[...step.from].join(',')}}, ${step.symbol}) = {${[...step.result].join(',')}}`
                          }
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Gallery */}
          <MachineGallery
            type="nfa"
            onGetSnapshot={getSnapshot}
            onLoadSnapshot={loadSnapshot}
          />
        </div>
        <Footer />
      </PageWrapper>

      <Modal open={addStateModal} onClose={() => setAddStateModal(false)} title="Add NFA State">
        <div className="space-y-4">
          <Input label="State Name" value={newStateName} onChange={(e) => setNewStateName(e.target.value)} placeholder="q4" />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={newStateAccept} onChange={(e) => setNewStateAccept(e.target.checked)} />
            Accept state
          </label>
          <Button onClick={() => { addState(newStateName, newStateAccept); setNewStateName(''); setAddStateModal(false); }} className="w-full">Add</Button>
        </div>
      </Modal>

      <Modal open={addTransModal} onClose={() => setAddTransModal(false)} title="Add Transition">
        <div className="space-y-4">
          <Select label="From" value={transSource} onChange={setTransSource} options={[{value:'',label:'Select...'}, ...stateOptions]} />
          <Input label="Symbol (ε for epsilon)" value={transSymbol} onChange={(e) => setTransSymbol(e.target.value)} placeholder="a" />
          <Select label="To" value={transTarget} onChange={setTransTarget} options={[{value:'',label:'Select...'}, ...stateOptions]} />
          <Button onClick={() => { addTransition(transSource, transSymbol, transTarget); setTransSymbol(''); setAddTransModal(false); }} className="w-full">Add</Button>
        </div>
      </Modal>
    </>
  );
}


