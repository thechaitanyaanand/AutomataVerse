import { create } from 'zustand';
import { TuringMachine } from '@/lib/turing';

export const TM_EXAMPLES = {
  palindrome: {
    name: 'Palindrome Checker',
    description: 'Checks if a string over {a, b} is a palindrome',
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'qa', 'qr'],
    alphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', 'X', 'Y', '_'],
    blank: '_',
    start: 'q0',
    accept: 'qa',
    reject: 'qr',
    transitions: {
      'q0,a': { write: 'X', direction: 'R', nextState: 'q1' },
      'q0,b': { write: 'X', direction: 'R', nextState: 'q2' },
      'q0,X': { write: 'X', direction: 'R', nextState: 'qa' },
      'q0,_': { write: '_', direction: 'R', nextState: 'qa' },
      // q1: scan right for matching 'a' at end
      'q1,a': { write: 'a', direction: 'R', nextState: 'q1' },
      'q1,b': { write: 'b', direction: 'R', nextState: 'q1' },
      'q1,X': { write: 'X', direction: 'L', nextState: 'q3' },
      'q1,_': { write: '_', direction: 'L', nextState: 'q3' },
      // q3: check if last char is 'a'
      'q3,a': { write: 'X', direction: 'L', nextState: 'q5' },
      'q3,b': { write: 'b', direction: 'L', nextState: 'qr' },
      'q3,X': { write: 'X', direction: 'R', nextState: 'qa' },
      // q2: scan right for matching 'b' at end
      'q2,a': { write: 'a', direction: 'R', nextState: 'q2' },
      'q2,b': { write: 'b', direction: 'R', nextState: 'q2' },
      'q2,X': { write: 'X', direction: 'L', nextState: 'q4' },
      'q2,_': { write: '_', direction: 'L', nextState: 'q4' },
      // q4: check if last char is 'b'
      'q4,b': { write: 'X', direction: 'L', nextState: 'q5' },
      'q4,a': { write: 'a', direction: 'L', nextState: 'qr' },
      'q4,X': { write: 'X', direction: 'R', nextState: 'qa' },
      // q5: go back to start
      'q5,a': { write: 'a', direction: 'L', nextState: 'q5' },
      'q5,b': { write: 'b', direction: 'L', nextState: 'q5' },
      'q5,X': { write: 'X', direction: 'R', nextState: 'q0' },
    },
  },
  equal_ab: {
    name: 'aⁿbⁿ Recognizer',
    description: 'Recognizes strings of the form aⁿbⁿ (n ≥ 1)',
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'qa', 'qr'],
    alphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', 'X', 'Y', '_'],
    blank: '_',
    start: 'q0',
    accept: 'qa',
    reject: 'qr',
    transitions: {
      'q0,a': { write: 'X', direction: 'R', nextState: 'q1' },
      'q0,Y': { write: 'Y', direction: 'R', nextState: 'q3' },
      'q0,_': { write: '_', direction: 'R', nextState: 'qr' },
      'q0,b': { write: 'b', direction: 'R', nextState: 'qr' },
      'q1,a': { write: 'a', direction: 'R', nextState: 'q1' },
      'q1,Y': { write: 'Y', direction: 'R', nextState: 'q1' },
      'q1,b': { write: 'Y', direction: 'L', nextState: 'q2' },
      'q2,a': { write: 'a', direction: 'L', nextState: 'q2' },
      'q2,Y': { write: 'Y', direction: 'L', nextState: 'q2' },
      'q2,X': { write: 'X', direction: 'R', nextState: 'q0' },
      'q3,Y': { write: 'Y', direction: 'R', nextState: 'q3' },
      'q3,_': { write: '_', direction: 'R', nextState: 'qa' },
      'q3,a': { write: 'a', direction: 'R', nextState: 'qr' },
      'q3,b': { write: 'b', direction: 'R', nextState: 'qr' },
    },
  },
  binary_increment: {
    name: 'Binary Increment',
    description: 'Adds 1 to a binary number on the tape',
    states: ['right', 'add', 'carry', 'done', 'qa'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blank: '_',
    start: 'right',
    accept: 'qa',
    reject: 'qr',
    transitions: {
      'right,0': { write: '0', direction: 'R', nextState: 'right' },
      'right,1': { write: '1', direction: 'R', nextState: 'right' },
      'right,_': { write: '_', direction: 'L', nextState: 'add' },
      'add,0': { write: '1', direction: 'L', nextState: 'done' },
      'add,1': { write: '0', direction: 'L', nextState: 'carry' },
      'add,_': { write: '1', direction: 'R', nextState: 'qa' },
      'carry,0': { write: '1', direction: 'L', nextState: 'done' },
      'carry,1': { write: '0', direction: 'L', nextState: 'carry' },
      'carry,_': { write: '1', direction: 'R', nextState: 'qa' },
      'done,0': { write: '0', direction: 'L', nextState: 'done' },
      'done,1': { write: '1', direction: 'L', nextState: 'done' },
      'done,_': { write: '_', direction: 'R', nextState: 'qa' },
    },
  },
};

const useTMStore = create((set, get) => ({
  selectedExample: 'palindrome',
  inputString: 'abba',
  simulation: null, // { steps: [config], currentStep, status }
  speed: 300,
  isPlaying: false,
  transitionTableData: [], // for editor

  setInputString: (str) => set({ inputString: str }),
  setSpeed: (speed) => set({ speed }),
  setSelectedExample: (key) => set({ selectedExample: key }),

  buildTM: () => {
    const { selectedExample } = get();
    const example = TM_EXAMPLES[selectedExample];
    if (!example) return null;

    const transitions = new Map(Object.entries(example.transitions));
    return new TuringMachine({
      states: example.states,
      alphabet: example.alphabet,
      tapeAlphabet: example.tapeAlphabet,
      blank: example.blank,
      transitions,
      start: example.start,
      accept: example.accept,
      reject: example.reject,
    });
  },

  startSimulation: () => {
    const { buildTM, inputString } = get();
    const tm = buildTM();
    if (!tm) return;

    const steps = [...tm.run(inputString)];
    set({
      simulation: { steps, currentStep: 0, status: 'running' },
      isPlaying: false,
    });
  },

  stepForward: () => set((s) => {
    if (!s.simulation) return {};
    const next = s.simulation.currentStep + 1;
    if (next >= s.simulation.steps.length) {
      return { simulation: { ...s.simulation, status: 'done' }, isPlaying: false };
    }
    return { simulation: { ...s.simulation, currentStep: next } };
  }),

  stepBackward: () => set((s) => {
    if (!s.simulation || s.simulation.currentStep <= 0) return {};
    return { simulation: { ...s.simulation, currentStep: s.simulation.currentStep - 1 } };
  }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  resetSimulation: () => set({ simulation: null, isPlaying: false }),
}));

export default useTMStore;
