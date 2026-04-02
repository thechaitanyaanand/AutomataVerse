export const DEAD_STATE = 'DEAD_STATE';

export class DFA {
  constructor(states, alphabet, transitions, start, accepting) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    // transitions: Map<"state,symbol", "nextState">
    this.transitions = transitions instanceof Map ? transitions : new Map(Object.entries(transitions));
    this.start = start;
    this.accepting = new Set(accepting);
  }

  step(currentState, symbol) {
    const key = `${currentState},${symbol}`;
    return this.transitions.get(key) ?? DEAD_STATE;
  }

  *simulate(input) {
    let state = this.start;
    yield { state, position: -1, phase: 'start' };
    
    for (let i = 0; i < input.length; i++) {
      const next = this.step(state, input[i]);
      yield { state: next, position: i, symbol: input[i], from: state, phase: 'compute' };
      state = next;
    }
    
    yield { 
      state, 
      position: input.length, 
      phase: 'done',
      accepted: this.accepting.has(state) 
    };
  }
}
