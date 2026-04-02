export class TuringMachine {
  constructor({ states, alphabet, tapeAlphabet, blank, transitions, start, accept, reject }) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    this.tapeAlphabet = new Set(tapeAlphabet);
    this.blank = blank;
    // transitions: Map<"state,symbol", {write, direction, nextState}>
    this.transitions = transitions instanceof Map ? transitions : new Map(Object.entries(transitions));
    this.start = start;
    this.accept = accept;
    this.reject = reject;
    this.tape = new Map();
  }
  
  *run(input) {
    this.tape.clear();
    input.split('').forEach((c, i) => this.tape.set(i, c));
    let head = 0;
    let state = this.start;
    let stepCount = 0;
    
    while (true) {
      const symbol = this.tape.get(head) ?? this.blank;
      yield { state, head, tape: new Map(this.tape), symbol, stepCount, phase: 'compute' };
      
      if (state === this.accept) { 
        yield { state, head, tape: new Map(this.tape), symbol, stepCount, phase: 'accepted' }; 
        return; 
      }
      if (state === this.reject) { 
        yield { phase: 'rejected', reason: 'Explicit reject state', state, head, tape: new Map(this.tape), symbol, stepCount }; 
        return; 
      }
      
      const key = `${state},${symbol}`;
      const t = this.transitions.get(key);
      
      if (!t) { 
        yield { phase: 'rejected', reason: 'No transition defined', state, head, tape: new Map(this.tape), symbol, stepCount }; 
        return; 
      }
      
      this.tape.set(head, t.write);
      state = t.nextState;
      head += t.direction === 'R' ? 1 : -1;
      
      stepCount++;
      if (stepCount >= 10000) {
        yield { phase: 'halted', reason: 'Infinite loop detected (10000 steps)', state, head, tape: new Map(this.tape), symbol, stepCount };
        return;
      }
    }
  }
}
