import { describe, it, expect } from 'vitest';
import { DFA, DEAD_STATE } from '../../src/lib/dfa';

describe('DFA', () => {
  it('simulates correctly for recognizing string ending in 1', () => {
    const states = ['q0', 'q1'];
    const alphabet = ['0', '1'];
    const transitions = new Map([
      ['q0,0', 'q0'],
      ['q0,1', 'q1'],
      ['q1,0', 'q0'],
      ['q1,1', 'q1']
    ]);
    const dfa = new DFA(states, alphabet, transitions, 'q0', ['q1']);

    const sim1 = [...dfa.simulate('0101')];
    expect(sim1[sim1.length - 1].accepted).toBe(true);
    
    const sim2 = [...dfa.simulate('100')];
    expect(sim2[sim2.length - 1].accepted).toBe(false);
  });

  it('handles dead states gracefully', () => {
    // Only accepts 'aa'
    const states = ['q0', 'q1', 'q2'];
    const alphabet = ['a', 'b'];
    const transitions = new Map([
      ['q0,a', 'q1'],
      ['q1,a', 'q2']
    ]); // missing transitions go to DEAD_STATE
    
    const dfa = new DFA(states, alphabet, transitions, 'q0', ['q2']);
    
    const sim1 = [...dfa.simulate('aab')];
    expect(sim1[sim1.length - 1].accepted).toBe(false);
    expect(sim1[sim1.length - 1].state).toBe(DEAD_STATE);
  });
});
