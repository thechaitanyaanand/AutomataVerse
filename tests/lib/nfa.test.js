import { describe, it, expect } from 'vitest';
import { NFA, EPSILON } from '../../src/lib/nfa';

describe('NFA', () => {
  it('epsilon closures and simulation works', () => {
    const states = ['q0', 'q1', 'q2'];
    const alphabet = ['a', 'b'];
    const transitions = new Map([
      [`q0,${EPSILON}`, new Set(['q1'])],
      ['q1,a', new Set(['q1', 'q2'])],
      ['q2,b', new Set(['q2'])]
    ]);
    
    const nfa = new NFA(states, alphabet, transitions, 'q0', ['q2']);
    
    expect([...nfa.epsilonClosure(['q0'])].sort()).toEqual(['q0', 'q1']);
    
    const sim1 = [...nfa.simulate('a')];
    expect(sim1[sim1.length - 1].accepted).toBe(true); // 'a' moves q1 to q2, q2 is accepting
  });
});
