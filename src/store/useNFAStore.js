import { create } from 'zustand';
import { NFA, EPSILON } from '@/lib/nfa';
import { generateId } from '@/lib/utils';

const useNFAStore = create((set, get) => ({
  nodes: [],
  edges: [],
  alphabet: ['a', 'b'],
  inputString: '',
  simulation: null,
  speed: 500,
  selectedNode: null,
  subsetConstruction: null, // { steps, dfaStates, dfaTransitions }

  addState: (label, isAccept = false) => set((s) => {
    const id = label || `q${s.nodes.length}`;
    return {
      nodes: [...s.nodes, {
        id,
        label: id,
        isStart: s.nodes.length === 0,
        isAccept,
        position: { x: 150 + s.nodes.length * 150, y: 200 }
      }]
    };
  }),

  removeState: (id) => set((s) => ({
    nodes: s.nodes.filter(n => n.id !== id),
    edges: s.edges.filter(e => e.source !== id && e.target !== id),
  })),

  toggleAccept: (id) => set((s) => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, isAccept: !n.isAccept } : n)
  })),

  setStart: (id) => set((s) => ({
    nodes: s.nodes.map(n => ({ ...n, isStart: n.id === id }))
  })),

  addTransition: (source, symbol, target) => set((s) => ({
    edges: [...s.edges, { id: generateId(), source, target, symbol }]
  })),

  removeTransition: (id) => set((s) => ({
    edges: s.edges.filter(e => e.id !== id)
  })),

  setInputString: (str) => set({ inputString: str }),
  setSpeed: (speed) => set({ speed }),

  buildNFA: () => {
    const { nodes, edges } = get();
    const states = nodes.map(n => n.id);
    const alphabet = [...new Set(edges.filter(e => e.symbol !== 'ε').map(e => e.symbol))];
    const transitions = new Map();

    for (const e of edges) {
      const key = `${e.source},${e.symbol}`;
      if (!transitions.has(key)) transitions.set(key, new Set());
      transitions.get(key).add(e.target);
    }

    const startNode = nodes.find(n => n.isStart);
    const acceptStates = nodes.filter(n => n.isAccept).map(n => n.id);

    if (!startNode) return null;

    return new NFA(states, alphabet, transitions, startNode.id, acceptStates);
  },

  startSimulation: () => {
    const { buildNFA, inputString } = get();
    const nfa = buildNFA();
    if (!nfa) return;

    const steps = [...nfa.simulate(inputString)];
    set({
      simulation: { steps, currentStep: 0, status: 'running' }
    });
  },

  stepForward: () => set((s) => {
    if (!s.simulation || s.simulation.currentStep >= s.simulation.steps.length - 1) {
      if (s.simulation) return { simulation: { ...s.simulation, status: 'done' } };
      return {};
    }
    return { simulation: { ...s.simulation, currentStep: s.simulation.currentStep + 1 } };
  }),

  stepBackward: () => set((s) => {
    if (!s.simulation || s.simulation.currentStep <= 0) return {};
    return { simulation: { ...s.simulation, currentStep: s.simulation.currentStep - 1 } };
  }),

  resetSimulation: () => set({ simulation: null, subsetConstruction: null }),

  loadExample: () => {
    // NFA for (a|b)*abb
    const nodes = [
      { id: 'q0', label: 'q0', isStart: true, isAccept: false, position: { x: 100, y: 200 } },
      { id: 'q1', label: 'q1', isStart: false, isAccept: false, position: { x: 300, y: 200 } },
      { id: 'q2', label: 'q2', isStart: false, isAccept: false, position: { x: 500, y: 200 } },
      { id: 'q3', label: 'q3', isStart: false, isAccept: true, position: { x: 700, y: 200 } },
    ];

    const edges = [
      { id: generateId(), source: 'q0', target: 'q0', symbol: 'a' },
      { id: generateId(), source: 'q0', target: 'q0', symbol: 'b' },
      { id: generateId(), source: 'q0', target: 'q1', symbol: 'a' },
      { id: generateId(), source: 'q1', target: 'q2', symbol: 'b' },
      { id: generateId(), source: 'q2', target: 'q3', symbol: 'b' },
    ];

    set({ nodes, edges, alphabet: ['a', 'b'], simulation: null, inputString: '' });
  },

  clearAll: () => set({
    nodes: [], edges: [], simulation: null, inputString: '', subsetConstruction: null
  }),
}));

export default useNFAStore;
