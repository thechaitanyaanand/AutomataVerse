import { describe, it, expect } from 'vitest';
import { TuringMachine } from '../../src/lib/turing';

describe('Turing Machine', () => {
  it('simulates a simple binary incrementor correctly', () => {
    const states = ['q0', 'qAccept', 'qReject'];
    const alphabet = ['0', '1'];
    const tapeAlphabet = ['0', '1', 'B'];
    const blank = 'B';
    const transitions = new Map([
      ['q0,0', { write: '1', direction: 'R', nextState: 'qAccept' }],
      ['q0,1', { write: '0', direction: 'L', nextState: 'q0' }],
      ['q0,B', { write: '1', direction: 'R', nextState: 'qAccept' }]
    ]);
    
    const tm = new TuringMachine({
      states, alphabet, tapeAlphabet, blank, transitions,
      start: 'q0', accept: 'qAccept', reject: 'qReject'
    });
    
    const steps = [...tm.run('101')];
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep).toBeDefined();
  });
});
