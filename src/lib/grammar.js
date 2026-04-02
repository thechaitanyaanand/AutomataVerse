// Grammar utilities — CFG parser and helpers

export function parseCFG(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const productions = new Map();
  let startVariable = null;
  const variables = new Set();
  const terminals = new Set();

  for (const line of lines) {
    const match = line.match(/^(\w+)\s*(?:->|→|:)\s*(.+)$/);
    if (!match) continue;

    const lhs = match[1];
    const rhsStr = match[2];

    if (!startVariable) startVariable = lhs;
    variables.add(lhs);

    const alternatives = rhsStr.split(/\s*\|\s*/);
    const rules = [];

    for (const alt of alternatives) {
      const trimmed = alt.trim();
      if (trimmed === 'ε' || trimmed === 'epsilon' || trimmed === '') {
        rules.push('');
      } else {
        const symbols = trimmed.split(/\s+/).length > 1
          ? trimmed.split(/\s+/)
          : trimmed.split('');
        rules.push(symbols);
      }
    }

    productions.set(lhs, (productions.get(lhs) || []).concat(rules));
  }

  // Determine terminals: any symbol that appears in RHS but is not a variable
  for (const [, rules] of productions) {
    for (const rule of rules) {
      if (typeof rule === 'string') continue;
      for (const sym of rule) {
        if (!variables.has(sym)) terminals.add(sym);
      }
    }
  }

  return { variables, terminals, productions, startVariable };
}

export function toCNF(cfg) {
  const steps = [];
  let { variables, terminals, productions, startVariable } = cfg;

  // Deep clone productions
  let prods = new Map();
  for (const [lhs, rules] of productions) {
    prods.set(lhs, rules.map(r => typeof r === 'string' ? r : [...r]));
  }

  // Step 1: New start variable
  const newStart = startVariable + "'";
  variables = new Set([...variables, newStart]);
  prods.set(newStart, [[startVariable]]);
  steps.push({ operation: 'ADD_START', description: `Added new start variable ${newStart}` });
  startVariable = newStart;

  // Step 2: Eliminate ε-productions
  const nullable = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [lhs, rules] of prods) {
      for (const rule of rules) {
        if (rule === '' || (Array.isArray(rule) && rule.every(s => nullable.has(s)))) {
          if (!nullable.has(lhs)) {
            nullable.add(lhs);
            changed = true;
          }
        }
      }
    }
  }

  if (nullable.size > 0) {
    const newProds = new Map();
    for (const [lhs, rules] of prods) {
      const newRules = [];
      for (const rule of rules) {
        if (rule === '') continue;
        if (!Array.isArray(rule)) continue;

        // Generate all combinations where nullable symbols can be absent
        const combos = generateNullableCombinations(rule, nullable);
        for (const combo of combos) {
          if (combo.length > 0) newRules.push(combo);
        }
      }
      newProds.set(lhs, newRules);
    }
    prods = newProds;
    steps.push({ operation: 'ELIMINATE_EPSILON', description: 'Eliminated ε-productions' });
  }

  // Step 3: Eliminate unit productions
  let unitChanged = true;
  while (unitChanged) {
    unitChanged = false;
    for (const [lhs, rules] of prods) {
      const newRules = [];
      for (const rule of rules) {
        if (Array.isArray(rule) && rule.length === 1 && variables.has(rule[0])) {
          // Unit production: A -> B
          const bRules = prods.get(rule[0]) || [];
          for (const br of bRules) {
            if (!(Array.isArray(br) && br.length === 1 && br[0] === lhs)) {
              newRules.push(br);
              unitChanged = true;
            }
          }
        } else {
          newRules.push(rule);
        }
      }
      prods.set(lhs, newRules);
    }
  }
  steps.push({ operation: 'ELIMINATE_UNIT', description: 'Eliminated unit productions' });

  // Step 4: Convert remaining to CNF
  let varCounter = 0;
  const terminalVars = new Map(); // terminal -> variable name

  function getTerminalVar(t) {
    if (!terminalVars.has(t)) {
      const name = `T_${t.toUpperCase()}${varCounter++}`;
      terminalVars.set(t, name);
      variables.add(name);
      prods.set(name, [t]); // for CNF: terminal var produces single terminal
    }
    return terminalVars.get(t);
  }

  const cnfProds = new Map();

  for (const [lhs, rules] of prods) {
    const cnfRules = [];

    for (const rule of rules) {
      if (typeof rule === 'string' && rule.length === 1) {
        // Single terminal — already in CNF
        cnfRules.push(rule);
        continue;
      }
      if (!Array.isArray(rule)) continue;

      if (rule.length === 1) {
        if (terminals.has(rule[0])) {
          cnfRules.push(rule[0]);
        } else {
          cnfRules.push([rule[0]]);
        }
        continue;
      }

      // Replace terminals with their variables
      let converted = rule.map(s => terminals.has(s) ? getTerminalVar(s) : s);

      // Break down long productions
      while (converted.length > 2) {
        const newVar = `X${varCounter++}`;
        variables.add(newVar);
        const rest = converted.splice(1);
        cnfProds.set(newVar, [rest.length === 2 ? rest : rest]);
        converted.push(newVar);
        converted = [converted[0], newVar];
        if (rest.length > 2) {
          prods.set(newVar, [rest]); // will be processed later
        } else {
          cnfProds.set(newVar, [rest]);
        }
        break;
      }

      cnfRules.push(converted);
    }

    cnfProds.set(lhs, cnfRules);
  }

  steps.push({ operation: 'CONVERT_CNF', description: 'Converted to Chomsky Normal Form' });

  return {
    cnf: { variables, terminals, productions: cnfProds, start: startVariable },
    steps
  };
}

function generateNullableCombinations(rule, nullable) {
  if (rule.length === 0) return [[]];

  const first = rule[0];
  const rest = rule.slice(1);
  const restCombos = generateNullableCombinations(rest, nullable);

  const results = [];
  for (const combo of restCombos) {
    results.push([first, ...combo]);
    if (nullable.has(first)) {
      results.push([...combo]);
    }
  }
  return results;
}

export function deriveString(cfg, targetString, maxDepth = 50) {
  const { productions, startVariable } = cfg;
  const queue = [{ sentential: [startVariable], steps: [] }];
  const visited = new Set();

  while (queue.length > 0 && queue.length < 10000) {
    const { sentential, steps } = queue.shift();
    const str = sentential.join('');

    if (str === targetString) return steps;
    if (steps.length >= maxDepth) continue;
    if (visited.has(str)) continue;
    visited.add(str);

    // Find leftmost variable
    const varIdx = sentential.findIndex(s => productions.has(s));
    if (varIdx === -1) continue;

    const variable = sentential[varIdx];
    const rules = productions.get(variable) || [];

    for (const rule of rules) {
      const newSentential = [
        ...sentential.slice(0, varIdx),
        ...(typeof rule === 'string' ? (rule === '' ? [] : [rule]) : rule),
        ...sentential.slice(varIdx + 1)
      ];
      queue.push({
        sentential: newSentential,
        steps: [...steps, { variable, rule, result: newSentential.join(''), position: varIdx }]
      });
    }
  }
  return null;
}

export function generateStrings(cfg, maxLength = 8) {
  const { productions, startVariable, terminals } = cfg;
  const results = new Set();
  const queue = [[startVariable]];
  const visited = new Set();

  while (queue.length > 0 && results.size < 100) {
    const current = queue.shift();
    const str = current.join('');
    if (visited.has(str)) continue;
    visited.add(str);

    // Check if it's a terminal string
    const isTerminal = current.every(s => !productions.has(s));
    if (isTerminal && str.length <= maxLength) {
      results.add(str);
      continue;
    }
    if (str.length > maxLength + 5) continue;

    const varIdx = current.findIndex(s => productions.has(s));
    if (varIdx === -1) continue;

    const variable = current[varIdx];
    const rules = productions.get(variable) || [];

    for (const rule of rules) {
      const newSeq = [
        ...current.slice(0, varIdx),
        ...(typeof rule === 'string' ? (rule === '' ? [] : [rule]) : rule),
        ...current.slice(varIdx + 1)
      ];
      if (newSeq.join('').length <= maxLength + 5) {
        queue.push(newSeq);
      }
    }
  }

  return [...results].sort((a, b) => a.length - b.length || a.localeCompare(b));
}
