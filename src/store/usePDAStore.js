import { create } from 'zustand';
import { generateId } from '@/lib/utils';

const usePDAStore = create((set, get) => ({
  nodes: [],
  edges: [],
  inputString: '',
  simulation: null,
  speed: 500,
  cfgText: 'S -> aSb | ε',

  addState: (label, isAccept = false, position = null) => set((s) => {
    const id = label || `q${s.nodes.length}`;
    let newPos = position;
    if (!newPos) {
      const positions = s.nodes.map(n => n.position);
      const maxX = positions.length ? Math.max(...positions.map(p => p.x), 100) : 100;
      newPos = { x: maxX + 200, y: 200 + Math.random() * 80 - 40 };
    }
    return {
      nodes: [...s.nodes, { id, label: id, isStart: s.nodes.length === 0, isAccept, position: newPos }]
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

  updateTransition: (id, newSymbol) => set((s) => ({
    edges: s.edges.map(e => e.id === id ? { ...e, symbol: newSymbol } : e)
  })),

  setInputString: (str) => set({ inputString: str }),
  setCfgText: (text) => set({ cfgText: text }),
  setSpeed: (speed) => set({ speed }),

  loadExample: () => {
    set({
      nodes: [
        { id: 'q0', label: 'q₀', isStart: true, isAccept: false, position: { x: 100, y: 200 } },
        { id: 'q1', label: 'q₁', isStart: false, isAccept: false, position: { x: 350, y: 200 } },
        { id: 'q2', label: 'q₂', isStart: false, isAccept: true, position: { x: 600, y: 200 } },
      ],
      edges: [
        { id: 'e1', source: 'q0', target: 'q1', symbol: 'ε, ε → $' },
        { id: 'e2', source: 'q1', target: 'q1', symbol: 'a, ε → a' },
        { id: 'e3', source: 'q1', target: 'q1', symbol: 'b, a → ε' },
        { id: 'e4', source: 'q1', target: 'q2', symbol: 'ε, $ → ε' },
      ],
      cfgText: 'S -> aSb | ε',
      inputString: 'aabb',
      simulation: null,
    });
  },

  resetSimulation: () => set({ simulation: null }),
  clearAll: () => set({ nodes: [], edges: [], simulation: null, inputString: '' }),
}));

export default usePDAStore;
