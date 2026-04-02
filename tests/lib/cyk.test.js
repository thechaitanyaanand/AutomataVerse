import { describe, it, expect } from 'vitest';
import { cyk } from '../../src/lib/cyk';

describe('CYK', () => {
  it('correctly parses an string based on CNF grammar', () => {
    const grammar = {
      start: 'S',
      productions: new Map([
        ['S', [['A', 'B'], ['B', 'C']]],
        ['A', [['B', 'A'], 'a']],
        ['B', [['C', 'C'], 'b']],
        ['C', [['A', 'B'], 'a']]
      ])
    };
    
    const result = cyk(grammar, 'baaba');
    expect(result.accepted).toBe(true);
    expect(result.table[0][4].has('S')).toBe(true);
  });

  it('rejects strings not in grammar', () => {
    const grammar = {
      start: 'S',
      productions: new Map([
        ['S', [['A', 'B']]],
        ['A', ['a']],
        ['B', ['b']]
      ])
    };
    const result = cyk(grammar, 'a');
    expect(result.accepted).toBe(false);
  });
});
