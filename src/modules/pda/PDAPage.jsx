import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import usePDAStore from '@/store/usePDAStore';
import useAppStore from '@/store/useAppStore';
import { Play } from 'lucide-react';

export default function PDAPage() {
  const { nodes, edges, inputString, cfgText, simulation,
    setInputString, setCfgText, loadExample, resetSimulation } = usePDAStore();
  
  const completeModule = useAppStore(state => state.completeModule);

  useEffect(() => { loadExample(); }, [loadExample]);

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-10">
          <SectionHeader
            title="Pushdown Automata"
            subtitle="Simulate PDAs with animated stack operations"
            badge="Context-Free"

          />

          <Card className="mb-6">
            <MathDisplay math="P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)" block />
            <p className="text-xs text-text-muted text-center">
              A PDA extends a finite automaton with a stack memory (Γ is the stack alphabet, Z₀ is the initial stack symbol).
            </p>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* PDA Graph */}
            <div className="lg:col-span-2 space-y-4">
              <AutomataGraph
                nodes={nodes}
                edges={edges}
                height="400px"
              />

              {/* Stack Visualization */}
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Stack</h3>
                <div className="flex items-end gap-1 min-h-[120px] justify-center">
                  {['$', 'a', 'a'].map((sym, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-12 h-12 flex items-center justify-center border border-violet/30 bg-violet/10 rounded-lg text-sm font-mono text-text-primary"
                    >
                      {sym}
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-text-muted text-center mt-2">← Top of Stack</p>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">CFG Input</h3>
                <textarea
                  value={cfgText}
                  onChange={(e) => setCfgText(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl text-sm font-mono bg-void border border-border text-text-primary resize-none focus:outline-none focus:border-violet"
                  placeholder="S -> aSb | ε"
                />
                <p className="text-xs text-text-muted mt-1">Format: Variable → production | alternative</p>
              </Card>

              <Card>
                <div className="flex gap-2 items-end mb-3">
                  <div className="flex-1">
                    <Input
                      label="Input String"
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="aabb"
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => {
                  completeModule('/pda');
                  // further simulation logic when implemented
                }}>
                  <Play size={14} /> Simulate PDA
                </Button>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transitions</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {edges.map((e, i) => (
                    <div key={i} className="text-xs font-mono text-text-secondary px-2 py-1 rounded bg-white/[0.02]">
                      {e.label}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Key Concepts</h3>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex gap-2">
                    <Badge variant="cyan">Push</Badge>
                    <span>Add symbol to stack top</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="warning">Pop</Badge>
                    <span>Remove symbol from stack top</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="default">ε</Badge>
                    <span>Epsilon (no input consumed)</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


