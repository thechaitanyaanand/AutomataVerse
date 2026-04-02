export const EPSILON = 'ε';

export class NFA {
  constructor(states, alphabet, transitions, start, accepting) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    // transitions: Map<"state,symbol", Set<nextState>>
    this.transitions = transitions instanceof Map ? transitions : new Map(Object.entries(transitions));
    this.start = start;
    this.accepting = new Set(accepting);
  }

  epsilonTransitions(state) {
    const key = `${state},${EPSILON}`;
    return this.transitions.get(key) || new Set();
  }

  transitionsFor(state, symbol) {
    const key = `${state},${symbol}`;
    return this.transitions.get(key) || new Set();
  }

  epsilonClosure(states) {
    const closure = new Set(states);
    const stack = [...states];
    
    while (stack.length) {
      const s = stack.pop();
      for (const t of this.epsilonTransitions(s)) {
        if (!closure.has(t)) {
          closure.add(t);
          stack.push(t);
        }
      }
    }
    return closure;
  }

  move(states, symbol) {
    const result = new Set();
    for (const s of states) {
      for (const t of this.transitionsFor(s, symbol)) {
        result.add(t);
      }
    }
    return result;
  }

  *simulate(input) {
    let currentStates = this.epsilonClosure([this.start]);
    yield { states: currentStates, position: -1, phase: 'start' };
    
    for (let i = 0; i < input.length; i++) {
      const symbol = input[i];
      const nextStates = this.epsilonClosure(this.move(currentStates, symbol));
      yield { states: nextStates, position: i, symbol, from: currentStates, phase: 'compute' };
      currentStates = nextStates;
    }
    
    const accepted = [...currentStates].some(s => this.accepting.has(s));
    yield { 
      states: currentStates, 
      position: input.length, 
      phase: 'done',
      accepted 
    };
  }
}
