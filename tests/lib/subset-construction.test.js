import { describe, it, expect } from 'vitest';
import { NFA, EPSILON } from '../../src/lib/nfa';
import { nfaToDfa, setKey } from '../../src/lib/subset-construction';

describe('Subset Construction', () => {
  it('converts NFA to DFA', () => {
    // NFA for (a|b)*abb
    const states = ['q0', 'q1', 'q2', 'q3'];
    const alphabet = ['a', 'b'];
    // q0 -a-> q0, q1
    // q0 -b-> q0
    // q1 -b-> q2
    // q2 -b-> q3
    const transitions = new Map([
      ['q0,a', new Set(['q0', 'q1'])],
      ['q0,b', new Set(['q0'])],
      ['q1,b', new Set(['q2'])],
      ['q2,b', new Set(['q3'])]
    ]);
    
    const nfa = new NFA(states, alphabet, transitions, 'q0', ['q3']);
    const { dfaStates, transitions: dfaTrans } = nfaToDfa(nfa);
    
    expect(dfaStates.size).toBeGreaterThan(0);
  });
});
