import { describe, it, expect } from 'vitest';
import { parseRegex } from '../../src/lib/regex-parser';
import { regexToNFA } from '../../src/lib/thompson';

describe('Thompson Construction', () => {
  it('builds NFA that correctly accepts regex language', () => {
    const ast = parseRegex('(a|b)*abb');
    const { nfa, steps } = regexToNFA(ast);
    
    expect(nfa.states.size).toBeGreaterThan(5);
    expect(steps.length).toBeGreaterThan(0);
    
    // Test simulation
    const sim1 = [...nfa.simulate('aabb')];
    expect(sim1[sim1.length-1].accepted).toBe(true);

    const sim2 = [...nfa.simulate('aba')];
    expect(sim2[sim2.length-1].accepted).toBe(false);
  });
});
