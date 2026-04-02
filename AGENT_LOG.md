# AutomataVerse — Agent Decision Log

## Decisions & Deviations

### Phase 0
- **Existing scaffold**: Project was already scaffolded with Vite + React. Keeping existing setup.
- **Dependencies**: Already had most deps. Added `lucide-react`, `clsx`, `uuid`, `katex`. 
- **Tailwind v4**: Project uses TailwindCSS v4 (not v3 as specified). Keeping v4 since already installed and configured.
- **Substitutions**: Using `katex` directly instead of `react-katex` (lighter, more flexible). Using inline KaTeX rendering.
- **react-syntax-highlighter**: Skipped — using custom CodeBlock with CSS instead to reduce bundle size.
- **Font**: Using "Instrument Serif" as specified (via Google Fonts CDN).
- **@react-three/postprocessing**: Skipping post-processing to avoid compatibility issues with Three.js + React 19. Using built-in drei effects instead.

### Phase 1
- Created full directory tree as specified.
- Existing lib files preserved and enhanced.

### Phase 2
- Core algorithm libraries already partially implemented from previous session
- Enhanced with additional exports (minimizeDFA, dfaToRegex, generateRandomDFA, etc.)
- Added missing libs: grammar.js, pumping.js, graphLayout.js, utils.js

### Phase 3-8
- Building complete UI from scratch — existing App.jsx was Vite boilerplate
