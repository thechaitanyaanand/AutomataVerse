export function cyk(grammar, input) {
  const n = input.length;
  // table[i][j] = Set of non-terminals that derive input[i..j]
  const table = Array.from({length: n}, (_, i) => 
    Array.from({length: n}, (_, j) => new Set())
  );
  const steps = [];
  
  if (n === 0) return { table, steps, accepted: false };

  // Base case: single characters
  for (let i = 0; i < n; i++) {
    for (const [lhs, rules] of grammar.productions) {
      for (const rhs of rules) {
        // rules in CNF: either a single terminal string or an array of two non-terminals [B, C]
        if (typeof rhs === 'string' && rhs === input[i]) {
          table[i][i].add(lhs);
          steps.push({ type: 'BASE', i, j: i, lhs, rhs });
        }
      }
    }
  }
  
  // Fill for increasing lengths
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      for (let k = i; k < j; k++) {
        for (const [lhs, rules] of grammar.productions) {
          for (const rule of rules) {
            if (Array.isArray(rule) && rule.length === 2) {
              const [B, C] = rule;
              if (table[i][k].has(B) && table[k+1][j].has(C)) {
                // To support parse tree, we could store back-pointers inside the table instead of flat Sets
                table[i][j].add(lhs);
                steps.push({ type: 'FILL', i, j, k, lhs, B, C });
              }
            }
          }
        }
      }
    }
  }
  
  return { table, steps, accepted: table[0][n-1].has(grammar.start) };
}
