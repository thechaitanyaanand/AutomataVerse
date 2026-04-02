import { describe, it, expect } from 'vitest';
import { parseRegex } from '../../src/lib/regex-parser';

describe('Regex Parser', () => {
  it('parses literal correctly', () => {
    const ast = parseRegex('x');
    expect(ast.type).toBe('LITERAL');
    expect(ast.char).toBe('x');
  });

  it('parses concatenation', () => {
    const ast = parseRegex('ab');
    expect(ast.type).toBe('CONCAT');
    expect(ast.left.char).toBe('a');
    expect(ast.right.char).toBe('b');
  });

  it('parses union', () => {
    const ast = parseRegex('a|b');
    expect(ast.type).toBe('UNION');
    expect(ast.left.char).toBe('a');
    expect(ast.right.char).toBe('b');
  });

  it('parses grouped quantifiers', () => {
    const ast = parseRegex('(a|b)*');
    expect(ast.type).toBe('STAR');
    expect(ast.child.type).toBe('UNION');
  });

  it('parses character classes', () => {
    const ast = parseRegex('[a-c]');
    expect(ast.type).toBe('UNION');
    // a|b|c -> ((a|b)|c) or (a|(b|c)) based on the right-leaning implementation
  });
});
