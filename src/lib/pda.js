export const EPSILON = 'ε';

export class NPDA {
  constructor(states, inputAlpha, stackAlpha, transitions, start, startStack, accepting) {
    this.states = new Set(states);
    this.inputAlpha = new Set(inputAlpha);
    this.stackAlpha = new Set(stackAlpha);
    // transitions: Map<"state,inputSymbol,stackTop", Array<{nextState, pushSymbols}>>
    this.transitions = transitions instanceof Map ? transitions : new Map(Object.entries(transitions));
    this.start = start;
    this.startStack = startStack;
    this.accepting = new Set(accepting);
  }
  
  // Apply a given transition to a configuration
  applyTransition(config, t) {
    const newStack = [...config.stack];
    
    // Pop the stack top symbol (if we matched one)
    if (t.pop !== EPSILON && newStack.length > 0) {
      newStack.pop();
    }
    
    // Push new symbols (if any)
    if (Array.isArray(t.push) && t.push.length > 0) {
      for (let i = t.push.length - 1; i >= 0; i--) {
        if (t.push[i] !== EPSILON) newStack.push(t.push[i]);
      }
    }
    
    return {
      state: t.nextState,
      inputPos: config.inputPos + (t.consume === EPSILON ? 0 : 1),
      stack: newStack
    };
  }

  // Returns array of all active configurations sequentially to model non-determinism
  *simulate(input) {
    let configs = [{ state: this.start, inputPos: 0, stack: [this.startStack] }];
    
    while (configs.length > 0) {
      yield configs;
      
      const nextConfigs = [];
      const seen = new Set();
      
      for (const config of configs) {
        const symbol = config.inputPos < input.length ? input[config.inputPos] : EPSILON;
        const stackTop = config.stack.length > 0 ? config.stack[config.stack.length - 1] : EPSILON;
        
        const candidateKeys = [
          `${config.state},${symbol},${stackTop}`, // Consume input and stack
          `${config.state},${symbol},${EPSILON}`,  // Consume input, ignore stack
          `${config.state},${EPSILON},${stackTop}`,// Epsilon input, consume stack
          `${config.state},${EPSILON},${EPSILON}`  // Epsilon input, ignore stack
        ];
        
        for (const [index, key] of candidateKeys.entries()) {
          const consumeSym = [0, 1].includes(index) ? symbol : EPSILON;
          // Filter valid epsilon moves at EOF
          if (consumeSym !== EPSILON && config.inputPos >= input.length) continue;
          
          const popSym = [0, 2].includes(index) ? stackTop : EPSILON;
          
          const rawTransitions = this.transitions.get(key) || [];
          for (const rt of rawTransitions) {
            const nextConf = this.applyTransition(config, { ...rt, consume: consumeSym, pop: popSym });
            
            const confHash = `${nextConf.state},${nextConf.inputPos},${nextConf.stack.join('')}`;
            if (!seen.has(confHash)) {
              seen.add(confHash);
              nextConfigs.push(nextConf);
            }
          }
        }
      }
      
      // Prevent infinite loops without progress by limiting depth or detecting simple cycles
      configs = nextConfigs;
      // Yield once more if done
      if (configs.every(c => c.inputPos >= input.length)) {
        yield configs;
        break; // Stop at end of input
      }
    }
  }
}
