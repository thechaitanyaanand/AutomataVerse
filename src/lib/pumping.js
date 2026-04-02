// Pumping Lemma proof checker

export const BUILTIN_LANGUAGES = [
  {
    id: 'a_n_b_n',
    display: 'aⁿbⁿ',
    description: "Equal a's and b's",
    isRegular: false,
    isCFL: true,
    generateWord: (p) => 'a'.repeat(p) + 'b'.repeat(p),
    check: (word) => {
      const n = word.length;
      if (n % 2 !== 0) return false;
      const half = n / 2;
      return word.slice(0, half) === 'a'.repeat(half) && word.slice(half) === 'b'.repeat(half);
    }
  },
  {
    id: 'palindromes',
    display: 'wwᴿ',
    description: 'Even-length palindromes over {a,b}',
    isRegular: false,
    isCFL: true,
    generateWord: (p) => {
      const half = 'a'.repeat(Math.ceil(p / 2)) + 'b'.repeat(Math.floor(p / 2));
      return half + half.split('').reverse().join('');
    },
    check: (word) => word === word.split('').reverse().join('') && word.length % 2 === 0
  },
  {
    id: 'a_star_b_star',
    display: 'a*b*',
    description: "a's followed by b's",
    isRegular: true,
    isCFL: true,
    generateWord: (p) => 'a'.repeat(p) + 'b'.repeat(p),
    check: (word) => /^a*b*$/.test(word)
  },
  {
    id: 'a_n_b_n_c_n',
    display: 'aⁿbⁿcⁿ',
    description: "Equal a's, b's, c's",
    isRegular: false,
    isCFL: false,
    generateWord: (p) => 'a'.repeat(p) + 'b'.repeat(p) + 'c'.repeat(p),
    check: (word) => {
      const n = word.length;
      if (n % 3 !== 0) return false;
      const third = n / 3;
      return (
        word.slice(0, third) === 'a'.repeat(third) &&
        word.slice(third, 2 * third) === 'b'.repeat(third) &&
        word.slice(2 * third) === 'c'.repeat(third)
      );
    }
  },
  {
    id: 'primes',
    display: 'aᵖ (p prime)',
    description: 'Prime-length strings',
    isRegular: false,
    isCFL: false,
    generateWord: (p) => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const prime = primes.find(pr => pr >= p) || primes[primes.length - 1];
      return 'a'.repeat(prime);
    },
    check: (word) => {
      if (!/^a+$/.test(word)) return false;
      const n = word.length;
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    }
  },
];

export function verifyPumpingDecomposition(language, pumpingLength, word, decomposition) {
  const { x, y, z } = decomposition;
  const langDef = BUILTIN_LANGUAGES.find(l => l.id === language);
  if (!langDef) return { valid: false, witness: null, error: 'Unknown language' };

  // Verify xyz = word
  if (x + y + z !== word) {
    return { valid: false, witness: null, error: 'xyz ≠ w: decomposition does not match the word' };
  }

  // Verify |y| ≥ 1
  if (y.length < 1) {
    return { valid: false, witness: null, error: '|y| must be ≥ 1' };
  }

  // Verify |xy| ≤ p
  if (x.length + y.length > pumpingLength) {
    return { valid: false, witness: null, error: `|xy| = ${x.length + y.length} > p = ${pumpingLength}` };
  }

  // Check pumping for various values of i
  for (let i = 0; i <= 10; i++) {
    if (i === 1) continue; // i=1 is the original word
    const pumpedWord = x + y.repeat(i) + z;
    const inLanguage = langDef.check(pumpedWord);

    if (!inLanguage) {
      return {
        valid: true,
        witness: {
          i,
          pumpedWord,
          reason: `xy${superscript(i)}z = "${pumpedWord}" (length ${pumpedWord.length}) is NOT in the language`
        }
      };
    }
  }

  return {
    valid: false,
    witness: null,
    error: 'Could not find a contradiction — this decomposition stays in the language for i=0..10'
  };
}

export function generatePumpingChallenge(languageId) {
  const lang = BUILTIN_LANGUAGES.find(l => l.id === languageId);
  if (!lang) return null;

  const pumpingLength = 4;
  const word = lang.generateWord(pumpingLength);

  return {
    language: lang,
    pumpingLength,
    word,
    hint: lang.isRegular
      ? 'This language IS regular — you won\'t be able to find a contradiction!'
      : `Try to find a decomposition where pumping y breaks the ${lang.display} property.`
  };
}

function superscript(n) {
  const sups = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(d => sups[d] || d).join('');
}
