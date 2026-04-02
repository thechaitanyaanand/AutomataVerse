import { NFA, EPSILON } from './nfa';

export function regexToNFA(ast) {
  let stateCounter = 0;
  const steps = [];
  const alphabet = new Set();
  
  function newState() { return `q${stateCounter++}`; }
  
  function addStep(desc, frag) {
    steps.push({ 
      type: 'THOMPSON', 
      description: desc, 
      fragment: {
        start: frag.start,
        accept: frag.accept,
        transitions: new Map(frag.transitions) // clone top level
      }
    });
  }

  function build(node) {
    if (node.type === 'EPSILON') {
      const start = newState(), accept = newState();
      const transitions = new Map([[ `${start},${EPSILON}`, new Set([accept]) ]]);
      const frag = { start, accept, transitions };
      addStep('Built EPSILON fragment', frag);
      return frag;
    }
    
    if (node.type === 'LITERAL') {
      alphabet.add(node.char);
      const start = newState(), accept = newState();
      const transitions = new Map([[ `${start},${node.char}`, new Set([accept]) ]]);
      const frag = { start, accept, transitions };
      addStep(`Built LITERAL '${node.char}' fragment`, frag);
      return frag;
    }
    
    if (node.type === 'CONCAT') {
      const left = build(node.left);
      const right = build(node.right);
      
      const transitions = new Map([...left.transitions, ...right.transitions]);
      // Connect left accept to right start via epsilon
      transitions.set(`${left.accept},${EPSILON}`, new Set([right.start]));
      
      const frag = { start: left.start, accept: right.accept, transitions };
      addStep('Concatenated two fragments', frag);
      return frag;
    }
    
    if (node.type === 'UNION') {
      const left = build(node.left);
      const right = build(node.right);
      
      const start = newState(), accept = newState();
      const transitions = new Map([...left.transitions, ...right.transitions]);
      
      transitions.set(`${start},${EPSILON}`, new Set([left.start, right.start]));
      
      transitions.set(`${left.accept},${EPSILON}`, new Set([accept]));
      transitions.set(`${right.accept},${EPSILON}`, new Set([accept]));
      
      const frag = { start, accept, transitions };
      addStep('Union of two fragments', frag);
      return frag;
    }
    
    if (node.type === 'STAR') {
      const child = build(node.child);
      const start = newState(), accept = newState();
      
      const transitions = new Map(child.transitions);
      transitions.set(`${start},${EPSILON}`, new Set([child.start, accept]));
      transitions.set(`${child.accept},${EPSILON}`, new Set([child.start, accept]));
      
      const frag = { start, accept, transitions };
      addStep('Kleene star applied', frag);
      return frag;
    }

    if (node.type === 'PLUS') {
      const child = build(node.child);
      const start = newState(), accept = newState();
      const transitions = new Map(child.transitions);
      transitions.set(`${start},${EPSILON}`, new Set([child.start]));
      transitions.set(`${child.accept},${EPSILON}`, new Set([child.start, accept]));
      const frag = { start, accept, transitions };
      addStep('One-or-more (+) applied', frag);
      return frag;
    }

    if (node.type === 'QMARK') {
      const child = build(node.child);
      const start = newState(), accept = newState();
      const transitions = new Map(child.transitions);
      transitions.set(`${start},${EPSILON}`, new Set([child.start, accept]));
      transitions.set(`${child.accept},${EPSILON}`, new Set([accept]));
      const frag = { start, accept, transitions };
      addStep('Optional (?) applied', frag);
      return frag;
    }
    
    throw new Error(`Unknown AST node type: ${node.type}`);
  }

  const result = build(ast);
  
  const states = new Set();
  for (const [key, targets] of result.transitions) {
    const [src] = key.split(',');
    states.add(src);
    for (const tgt of targets) states.add(tgt);
  }
  states.add(result.start);
  states.add(result.accept);

  const nfa = new NFA(
    Array.from(states),
    Array.from(alphabet),
    result.transitions,
    result.start,
    [result.accept]
  );
  
  return { nfa, steps };
}
