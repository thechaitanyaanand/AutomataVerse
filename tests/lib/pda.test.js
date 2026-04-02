import { describe, it, expect } from 'vitest';
import { NPDA, EPSILON } from '../../src/lib/pda';

describe('PDA', () => {
  it('simulates a simple a^n b^n PDA', () => {
    const states = ['q0', 'q1', 'q2', 'q3'];
    const inputAlpha = ['a', 'b'];
    const stackAlpha = ['Z', 'A'];
    // transitions: Map<"state,inputSymbol,stackTop", Array<{nextState, pushSymbols}>>
    const transitions = new Map([
      ['q0,ε,Z', [{ nextState: 'q1', push: ['A', 'Z'] }]],
      ['q1,a,A', [{ nextState: 'q1', push: ['A', 'A'] }]],
      ['q1,b,A', [{ nextState: 'q2', push: [] }]],
      ['q2,b,A', [{ nextState: 'q2', push: [] }]],
      ['q2,ε,Z', [{ nextState: 'q3', push: ['Z'] }]]
    ]);
    
    const pda = new NPDA(states, inputAlpha, stackAlpha, transitions, 'q0', 'Z', ['q3']);
    
    const sim1 = Array.from(pda.simulate('ab'));
    expect(sim1.length).toBeGreaterThan(0);
  });
});
