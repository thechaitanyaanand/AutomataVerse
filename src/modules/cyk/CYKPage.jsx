import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import MathDisplay from '@/components/ui/MathDisplay';
import { cyk } from '@/lib/cyk';
import useAppStore from '@/store/useAppStore';

const DEFAULT_GRAMMAR = { start: 'S', productions: new Map([['S', [['A', 'B'], 'c']], ['A', ['a', ['A', 'A']]], ['B', ['b', ['B', 'B']]]]) };
const ANBN_GRAMMAR = { start: 'S', productions: new Map([['S', [['A', 'B'], ['A', 'C']]], ['A', ['a']], ['B', ['b']], ['C', [['S', 'B']]]]) };

export default function CYKPage() {
  const [inputStr, setInputStr] = useState('aabb');
  const [result, setResult] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const completeModule = useAppStore(state => state.completeModule);

  const runCYK = () => {
    const res = cyk(ANBN_GRAMMAR, inputStr);
    setResult(res);
    setActiveCell(null);
    completeModule('/cyk');
  };

  const n = inputStr.length;

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader title="CYK Parser" subtitle="Parse context-free grammars with the CYK algorithm" badge="Parsing" />

          <Card className="mb-6">
            <MathDisplay math="T[i,j] = \{ A \mid A \to BC, B \in T[i,k], C \in T[k+1,j] \}" block />
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-1">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Grammar (CNF)</h3>
              <div className="space-y-1 text-xs font-mono text-text-secondary mb-4">
                <div>S → AB | AC</div>
                <div>A → a</div>
                <div>B → b</div>
                <div>C → SB</div>
              </div>
              <p className="text-xs text-text-muted mb-3">This grammar recognizes aⁿbⁿ</p>
              <Input label="Input String" value={inputStr} onChange={(e) => setInputStr(e.target.value)} placeholder="aabb" className="font-mono" />
              <Button onClick={runCYK} className="w-full mt-3"><Play size={14} /> Parse</Button>
            </Card>

            <Card className="md:col-span-2">
              <h3 className="text-sm font-semibold text-text-primary mb-3">CYK Table</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="mx-auto">
                      <tbody>
                        {Array.from({ length: n }, (_, row) => n - 1 - row).map(len => (
                          <tr key={len}>
                            {Array.from({ length: n - len }, (_, col) => {
                              const i = col;
                              const j = col + len;
                              const cellSet = result.table[i]?.[j];
                              const vars = cellSet ? [...cellSet] : [];
                              const isTopRight = i === 0 && j === n - 1;
                              const containsStart = cellSet?.has(ANBN_GRAMMAR.start);
                              return (
                                <td key={`${i}-${j}`} className="p-1">
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (len * n + col) * 0.03 }}
                                    onClick={() => setActiveCell({ i, j })}
                                    className={`w-16 h-12 flex items-center justify-center rounded-lg text-xs font-mono cursor-pointer border transition-all ${
                                      isTopRight && containsStart ? 'bg-success/15 border-success/30 text-success' :
                                      vars.length > 0 ? 'bg-violet/10 border-violet/20 text-violet-light' :
                                      'bg-white/[0.02] border-white/5 text-text-muted'
                                    }`}
                                  >
                                    {vars.length > 0 ? `{${vars.join(',')}}` : '∅'}
                                  </motion.div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr>
                          {inputStr.split('').map((c, i) => (
                            <td key={i} className="p-1 text-center text-xs text-cyan-light font-mono">{c}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center">
                    <Badge variant={result.accepted ? 'success' : 'danger'} className="text-sm px-4 py-1">
                      {result.accepted ? '✓ String Accepted' : '✗ String Rejected'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                  Enter a string and click Parse to see the CYK table
                </div>
              )}
            </Card>
          </div>

          {result && (
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Construction Steps</h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.steps.map((step, i) => (
                  <div key={i} className="text-xs font-mono text-text-secondary px-2 py-1 rounded bg-white/[0.02]">
                    {step.type === 'BASE'
                      ? `T[${step.i},${step.j}] += ${step.lhs} (from '${step.rhs}')`
                      : `T[${step.i},${step.j}] += ${step.lhs} (from ${step.B} ∈ T[${step.i},${step.k}], ${step.C} ∈ T[${step.k+1},${step.j}])`
                    }
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


