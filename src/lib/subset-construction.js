import { EPSILON } from './nfa';

export function setKey(set) {
  return [...set].sort().join(',');
}

export function nfaToDfa(nfa) {
  const steps = [];
  
  const startClosure = nfa.epsilonClosure([nfa.start]);
  const startKey = setKey(startClosure);
  
  const dfaStates = new Map();
  const queue = [startClosure];
  const transitions = new Map();
  
  while (queue.length) {
    const current = queue.shift();
    const key = setKey(current);
    
    if (dfaStates.has(key)) continue;
    
    const isAccept = [...current].some(s => nfa.accepting.has(s));
    dfaStates.set(key, { id: key, states: current, isAccept });
    
    steps.push({ type: 'PROCESS_SET', set: current });
    
    for (const symbol of nfa.alphabet) {
      if (symbol === EPSILON) continue;
      
      const reachable = nfa.move(current, symbol);
      const closure = nfa.epsilonClosure(reachable);
      
      if (closure.size > 0) {
        steps.push({ type: 'COMPUTE_MOVE', from: current, symbol, result: closure });
        const closureKey = setKey(closure);
        transitions.set(`${key},${symbol}`, closureKey);
        
        if (!dfaStates.has(closureKey)) {
          queue.push(closure);
        }
      }
    }
  }
  
  return { dfaStates, transitions, steps };
}
