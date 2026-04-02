import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, AlertCircle, Check } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import AutomataGraph from '@/components/graph/AutomataGraph';
import MathDisplay from '@/components/ui/MathDisplay';
import { parseRegex, ParseError } from '@/lib/regex-parser';
import { regexToNFA } from '@/lib/thompson';

import useAppStore from '@/store/useAppStore';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';

export default function RegExPage() {
  const [regex, setRegex] = useState('a(b|c)*');
  const [testString, setTestString] = useState('abbc');
  const [error, setError] = useState(null);
  const [nfaResult, setNfaResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const completeModule = useAppStore(state => state.completeModule);

  const buildNFA = () => {
    try {
      const ast = parseRegex(regex);
      const result = regexToNFA(ast);
      setNfaResult(result);
      setError(null);
    } catch (e) {
      if (e instanceof ParseError) {
        setError(e.message);
      } else {
        setError('Invalid regex');
      }
      setNfaResult(null);
    }
  };

  const runTest = () => {
    if (!nfaResult) return;
    const steps = [...nfaResult.nfa.simulate(testString)];
    const last = steps[steps.length - 1];
    setTestResult({
      accepted: last?.accepted ?? false,
      steps,
    });
    if (last?.accepted) {
      audio.playSuccess();
      fireConfetti();
      completeModule('/regex');
    } else {
      audio.playError();
    }
  };

  // Build graph data from NFA
  const graphData = useMemo(() => {
    if (!nfaResult) return { nodes: [], edges: [] };

    const nfa = nfaResult.nfa;
    const nodes = [...nfa.states].map((s, i) => ({
      id: s,
      label: s,
      isStart: s === nfa.start,
      isAccept: nfa.accepting.has(s),
      position: { x: 100 + (i % 6) * 130, y: 100 + Math.floor(i / 6) * 150 }
    }));

    const edges = [];
    let edgeId = 0;
    for (const [key, targets] of nfa.transitions) {
      const parts = key.split(',');
      const source = parts[0];
      const symbol = parts.slice(1).join(',');
      for (const target of targets) {
        edges.push({ id: `e${edgeId++}`, source, target, symbol });
      }
    }

    return { nodes, edges };
  }, [nfaResult]);

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader
            title="Regular Expressions"
            subtitle="Thompson's Construction: convert regular expressions to NFAs"
            badge="RegExp → NFA"

          />

          <Card className="mb-6">
            <MathDisplay math="r \xrightarrow{\text{Thompson's}} N_r = (Q, \Sigma, \delta, q_0, \{q_f\})" block />
          </Card>

          {/* Regex Input */}
          <Card className="mb-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Regular Expression"
                  value={regex}
                  onChange={(e) => { setRegex(e.target.value); setError(null); }}
                  placeholder="a(b|c)*"
                  className="font-mono text-lg"
                  error={error}
                />
              </div>
              <Button onClick={buildNFA}>
                <Play size={14} /> Build NFA
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['a(b|c)*', '(a|b)*abb', 'a+b?c*', '(0|1)*01', '[a-c]+'].map(ex => (
                <button
                  key={ex}
                  onClick={() => setRegex(ex)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:border-violet/30 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>

          {/* NFA Visualization */}
          {nfaResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <AutomataGraph
                nodes={graphData.nodes}
                edges={graphData.edges}
                height="400px"
              />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Construction Steps */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Construction Steps</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {nfaResult.steps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <span className="text-xs text-text-muted font-mono shrink-0 mt-0.5">
                          {i + 1}.
                        </span>
                        <div>
                          <p className="text-xs text-text-primary">{step.description}</p>
                          <p className="text-[10px] text-text-muted font-mono mt-0.5">
                            {step.fragment.start} → {step.fragment.accept}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Test Panel */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Test String</h3>
                  <div className="flex gap-2 items-end mb-4">
                    <div className="flex-1">
                      <Input
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="abbc"
                        className="font-mono"
                      />
                    </div>
                    <Button variant="secondary" onClick={runTest}>Test</Button>
                  </div>

                  {testResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-2 p-3 rounded-xl ${
                        testResult.accepted
                          ? 'bg-success/10 border border-success/20'
                          : 'bg-danger/10 border border-danger/20'
                      }`}
                    >
                      {testResult.accepted
                        ? <><Check size={16} className="text-success" /><span className="text-sm text-success">Accepted</span></>
                        : <><AlertCircle size={16} className="text-danger" /><span className="text-sm text-danger">Rejected</span></>
                      }
                    </motion.div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-text-muted mb-2">NFA Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-text-muted">States:</span>{' '}
                        <span className="text-text-primary font-mono">{nfaResult.nfa.states.size}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-text-muted">Transitions:</span>{' '}
                        <span className="text-text-primary font-mono">{nfaResult.nfa.transitions.size}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


