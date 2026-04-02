import { create } from 'zustand';

const usePDAStore = create((set, get) => ({
  nodes: [],
  edges: [],
  inputString: '',
  simulation: null,
  speed: 500,
  cfgText: 'S -> aSb | ε',

  addState: (label, isAccept = false) => set((s) => ({
    nodes: [...s.nodes, {
      id: label || `q${s.nodes.length}`,
      label: label || `q${s.nodes.length}`,
      isStart: s.nodes.length === 0,
      isAccept,
      position: { x: 150 + s.nodes.length * 200, y: 200 }
    }]
  })),

  removeState: (id) => set((s) => ({
    nodes: s.nodes.filter(n => n.id !== id),
    edges: s.edges.filter(e => e.source !== id && e.target !== id),
  })),

  setInputString: (str) => set({ inputString: str }),
  setCfgText: (text) => set({ cfgText: text }),
  setSpeed: (speed) => set({ speed }),

  loadExample: () => {
    set({
      nodes: [
        { id: 'q0', label: 'q₀ (start)', isStart: true, isAccept: false, position: { x: 100, y: 200 } },
        { id: 'q1', label: 'q₁ (loop)', isStart: false, isAccept: false, position: { x: 350, y: 200 } },
        { id: 'q2', label: 'q₂ (accept)', isStart: false, isAccept: true, position: { x: 600, y: 200 } },
      ],
      edges: [
        { id: 'e1', source: 'q0', target: 'q1', label: 'ε, ε → $' },
        { id: 'e2', source: 'q1', target: 'q1', label: 'a, ε → a' },
        { id: 'e3', source: 'q1', target: 'q1', label: 'b, a → ε' },
        { id: 'e4', source: 'q1', target: 'q2', label: 'ε, $ → ε' },
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
