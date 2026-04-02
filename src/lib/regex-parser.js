export class ParseError extends Error {
  constructor(message, position) {
    super(`${message} at position ${position}`);
    this.position = position;
  }
}

export function parseRegex(input) {
  let pos = 0;

  function peek() { return input[pos]; }
  function consume() { return input[pos++]; }
  function isAtEnd() { return pos >= input.length; }

  // E -> T ('|' E)?
  function parseUnion() {
    let left = parseConcat();
    while (peek() === '|') {
      consume();
      const right = parseUnion();
      left = { type: 'UNION', left, right };
    }
    return left;
  }

  // T -> F T?
  function parseConcat() {
    const nodes = [];
    while (!isAtEnd() && peek() !== '|' && peek() !== ')') {
      nodes.push(parseQuantifier());
    }
    if (nodes.length === 0) return { type: 'EPSILON' };
    if (nodes.length === 1) return nodes[0];
    
    // Convert array of nodes into a left-leaning tree of CONCATs
    return nodes.reduce((acc, curr) => ({ type: 'CONCAT', left: acc, right: curr }));
  }

  // F -> P ('*' | '+' | '?')?
  function parseQuantifier() {
    const expr = parsePrimary();
    if (peek() === '*') { consume(); return { type: 'STAR', child: expr }; }
    if (peek() === '+') { consume(); return { type: 'PLUS', child: expr }; }
    if (peek() === '?') { consume(); return { type: 'QMARK', child: expr }; }
    return expr;
  }

  function expandCharClass(chars, startPos) {
    const result = [];
    for(let i=0; i<chars.length; i++) {
      if(chars[i] === '-' && i>0 && i<chars.length-1) {
        const start = chars.charCodeAt(i-1);
        const end = chars.charCodeAt(i+1);
        if(start > end) throw new ParseError('Invalid range', startPos + i);
        for(let c=start+1; c<=end; c++) result.push(String.fromCharCode(c));
        i++; // skip 'end' char
      } else {
        result.push(chars[i]);
      }
    }
    if(result.length === 0) return { type: 'EPSILON' };
    
    return result.map(c => ({ type: 'LITERAL', char: c }))
      .reduce((acc, curr) => ({ type: 'UNION', left: acc, right: curr }));
  }

  // P -> '(' E ')' | '[' chars ']' | char | '\' char
  function parsePrimary() {
    if (isAtEnd()) return { type: 'EPSILON' };
    
    const c = peek();
    
    if (c === '(') {
      consume();
      const expr = parseUnion();
      if (peek() !== ')') throw new ParseError('Expected closing parenthesis', pos);
      consume(); // ')'
      return expr;
    }
    
    if (c === '[') {
      const startPos = pos;
      consume();
      let chars = '';
      while (!isAtEnd() && peek() !== ']') {
        if (peek() === '\\') { consume(); chars += consume(); continue; }
        chars += consume();
      }
      if (peek() !== ']') throw new ParseError('Expected closing bracket', pos);
      consume(); // ']'
      return expandCharClass(chars, startPos);
    }
    
    if (c === '\\') {
      consume();
      if (isAtEnd()) throw new ParseError('Unexpected end of escape sequence', pos);
      return { type: 'LITERAL', char: consume() };
    }
    
    if ('|*+?)'.includes(c)) {
      throw new ParseError(`Unexpected operator '${c}'`, pos);
    }
    
    return { type: 'LITERAL', char: consume() };
  }

  if (input === '') return { type: 'EPSILON' };
  
  const ast = parseUnion();
  if (!isAtEnd()) {
    throw new ParseError(`Unexpected character '${peek()}'`, pos);
  }
  return ast;
}
