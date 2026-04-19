import { create } from 'zustand';
import { DFA } from '@/lib/dfa';
import { generateId } from '@/lib/utils';

export const DFA_EXAMPLES = {
  binary_div3: {
    name: 'Binary numbers divisible by 3',
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    transitions: {
      'q0,0': 'q0', 'q0,1': 'q1',
      'q1,0': 'q2', 'q1,1': 'q0',
      'q2,0': 'q1', 'q2,1': 'q2'
    },
    startState: 'q0',
    acceptStates: ['q0'],
    description: 'Recognizes binary representations of numbers divisible by 3.',
  },
  ends_01: {
    name: 'Strings ending in 01',
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    transitions: {
      'q0,0': 'q1', 'q0,1': 'q0',
      'q1,0': 'q1', 'q1,1': 'q2',
      'q2,0': 'q1', 'q2,1': 'q0'
    },
    startState: 'q0',
    acceptStates: ['q2'],
    description: 'Accepts binary strings that end with "01".',
  },
  even_zeros: {
    name: 'Even number of zeros',
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    transitions: {
      'q0,0': 'q1', 'q0,1': 'q0',
      'q1,0': 'q0', 'q1,1': 'q1'
    },
    startState: 'q0',
    acceptStates: ['q0'],
    description: 'Accepts strings with an even number of 0s (including zero 0s).',
  },
};

const initialNodes = () => [
  { id: 'q0', label: 'q0', isStart: true, isAccept: true, position: { x: 150, y: 200 } },
  { id: 'q1', label: 'q1', isStart: false, isAccept: false, position: { x: 350, y: 100 } },
  { id: 'q2', label: 'q2', isStart: false, isAccept: false, position: { x: 350, y: 300 } },
];

const initialEdges = () => [
  { id: 'e1', source: 'q0', target: 'q0', symbol: '0' },
  { id: 'e2', source: 'q0', target: 'q1', symbol: '1' },
  { id: 'e3', source: 'q1', target: 'q2', symbol: '0' },
  { id: 'e4', source: 'q1', target: 'q0', symbol: '1' },
  { id: 'e5', source: 'q2', target: 'q1', symbol: '0' },
  { id: 'e6', source: 'q2', target: 'q2', symbol: '1' },
];

const useDFAStore = create((set, get) => ({
  nodes: initialNodes(),
  edges: initialEdges(),
  alphabet: ['0', '1'],
  inputString: '',
  simulation: null, // { steps, currentStep, status: 'idle'|'running'|'paused'|'done' }
  speed: 500,
  selectedNode: null,
  selectedExample: 'binary_div3',

  // Node actions
  // Node actions
  addState: (label, isAccept = false, position = null) => set((s) => {
    const id = label || `q${s.nodes.length}`;
    
    let newPos = position;
    if (!newPos) {
      const positions = s.nodes.map(n => n.position);
      const maxX = Math.max(...positions.map(p => p.x), 200);
      newPos = { x: maxX + 150, y: 200 + Math.random() * 100 - 50 };
    }

    return {
      nodes: [...s.nodes, {
        id,
        label: id,
        isStart: s.nodes.length === 0,
        isAccept,
        position: newPos
      }]
    };
  }),

  removeState: (id) => set((s) => ({
    nodes: s.nodes.filter(n => n.id !== id),
    edges: s.edges.filter(e => e.source !== id && e.target !== id),
    selectedNode: s.selectedNode === id ? null : s.selectedNode,
  })),

  toggleAccept: (id) => set((s) => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, isAccept: !n.isAccept } : n)
  })),

  setStart: (id) => set((s) => ({
    nodes: s.nodes.map(n => ({ ...n, isStart: n.id === id }))
  })),

  updateNodePosition: (id, position) => set((s) => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, position } : n)
  })),

  selectNode: (id) => set({ selectedNode: id }),

  // Edge actions
  addTransition: (source, symbol, target) => set((s) => {
    const existing = s.edges.find(e => e.source === source && e.target === target && e.symbol === symbol);
    if (existing) return {};
    return {
      edges: [...s.edges, { id: generateId(), source, target, symbol }]
    };
  }),

  removeTransition: (id) => set((s) => ({
    edges: s.edges.filter(e => e.id !== id)
  })),

  updateTransition: (id, newSymbol) => set((s) => ({
    edges: s.edges.map(e => e.id === id ? { ...e, symbol: newSymbol } : e)
  })),

  setAlphabet: (alpha) => set({ alphabet: alpha }),
  setInputString: (str) => set({ inputString: str }),
  setSpeed: (speed) => set({ speed }),

  // Build DFA from current state
  buildDFA: () => {
    const { nodes, edges } = get();
    const states = nodes.map(n => n.id);
    const alphabet = [...new Set(edges.map(e => e.symbol))];
    const transitions = new Map();
    for (const e of edges) {
      transitions.set(`${e.source},${e.symbol}`, e.target);
    }
    const startNode = nodes.find(n => n.isStart);
    const acceptStates = nodes.filter(n => n.isAccept).map(n => n.id);

    if (!startNode) return null;

    return new DFA(states, alphabet, transitions, startNode.id, acceptStates);
  },

  // Simulation
  startSimulation: () => {
    const { buildDFA, inputString } = get();
    const dfa = buildDFA();
    if (!dfa) return;

    const steps = [...dfa.simulate(inputString)];
    set({
      simulation: {
        steps,
        currentStep: 0,
        status: 'running'
      }
    });
  },

  stepForward: () => set((s) => {
    if (!s.simulation || s.simulation.currentStep >= s.simulation.steps.length - 1) {
      if (s.simulation) return { simulation: { ...s.simulation, status: 'done' } };
      return {};
    }
    return {
      simulation: {
        ...s.simulation,
        currentStep: s.simulation.currentStep + 1
      }
    };
  }),

  stepBackward: () => set((s) => {
    if (!s.simulation || s.simulation.currentStep <= 0) return {};
    return {
      simulation: {
        ...s.simulation,
        currentStep: s.simulation.currentStep - 1
      }
    };
  }),

  resetSimulation: () => set({ simulation: null }),

  // Load example
  loadExample: (exampleKey) => {
    const example = DFA_EXAMPLES[exampleKey];
    if (!example) return;

    const nodes = example.states.map((s, i) => ({
      id: s,
      label: s,
      isStart: s === example.startState,
      isAccept: example.acceptStates.includes(s),
      position: {
        x: 150 + (i % 3) * 200,
        y: 150 + Math.floor(i / 3) * 200
      }
    }));

    const edges = [];
    const trans = example.transitions;
    for (const [key, target] of Object.entries(trans)) {
      const [source, symbol] = key.split(',');
      edges.push({ id: generateId(), source, target, symbol });
    }

    set({
      nodes,
      edges,
      alphabet: example.alphabet,
      selectedExample: exampleKey,
      simulation: null,
      inputString: '',
    });
  },

  clearAll: () => set({
    nodes: [],
    edges: [],
    alphabet: [],
    simulation: null,
    inputString: '',
    selectedNode: null,
  }),
}));

export default useDFAStore;
