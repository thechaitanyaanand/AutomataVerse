import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { useEffect } from 'react';

const hierarchy = [
  { type: 0, name: 'Recursively Enumerable', short: 'Type 0', machine: 'Turing Machine', link: '/turing', color: '#E8459B', widthPct: 100, closures: ['∪','∩','·','*'], notClosed: ['complement'] },
  { type: 1, name: 'Context-Sensitive', short: 'Type 1', machine: 'Linear Bounded Automaton', link: '/pda', color: '#F0A830', widthPct: 80, closures: ['∪','∩','complement','·','*'], notClosed: [] },
  { type: 2, name: 'Context-Free', short: 'Type 2', machine: 'Pushdown Automaton', link: '/pda', color: '#FBBF24', widthPct: 60, closures: ['∪','·','*'], notClosed: ['∩','complement'] },
  { type: 3, name: 'Regular', short: 'Type 3', machine: 'DFA / NFA', link: '/dfa', color: '#34D399', widthPct: 40, closures: ['∪','∩','complement','·','*'], notClosed: [] },
];

export default function ChomskyPage() {
  const [selected, setSelected] = useState(null);
  const completeModule = useAppStore(state => state.completeModule);

  useEffect(() => { completeModule('/chomsky'); }, [completeModule]);

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-10">
          <SectionHeader
            title="The Chomsky Hierarchy"
            subtitle="Four levels of formal grammars and their computational power"
            badge="Foundation"
          />

          <div className="mb-12 flex flex-col items-center">
            {hierarchy.map((level, i) => (
              <motion.div
                key={level.type}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.15 * (3 - i), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-3 cursor-pointer w-full"
                style={{ maxWidth: `${level.widthPct}%` }}
                onClick={() => setSelected(selected === level.type ? null : level.type)}
              >
                <div
                  className="rounded-2xl py-5 px-6 border border-white/10 hover:border-white/25 transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${level.color}18, ${level.color}06)`,
                    borderColor: selected === level.type ? `${level.color}60` : undefined,
                    boxShadow: selected === level.type ? `0 0 30px ${level.color}15` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge style={{ background: `${level.color}20`, color: level.color, borderColor: `${level.color}40` }}>
                        {level.short}
                      </Badge>
                      <span className="font-display text-lg text-text-primary">{level.name}</span>
                    </div>
                    <span className="text-sm text-text-muted hidden sm:block">{level.machine}</span>
                  </div>
                </div>

                {selected === level.type && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                    <Card>
                      <p className="text-sm text-text-secondary mb-4">
                        Recognized by: <strong className="text-text-primary">{level.machine}</strong>
                      </p>
                      <div className="mb-4">
                        <span className="text-xs text-text-muted mr-2">Closed under:</span>
                        {level.closures.map(c => <Badge key={c} variant="success" className="ml-1">{c}</Badge>)}
                        {level.notClosed.map(c => <Badge key={c} variant="danger" className="ml-1">✗ {c}</Badge>)}
                      </div>
                      <Link to={level.link} className="inline-flex items-center gap-1.5 text-sm text-flora-light hover:text-flora transition-colors">
                        Open Simulator <ArrowRight size={14} />
                      </Link>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}
