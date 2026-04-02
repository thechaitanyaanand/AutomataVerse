import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Cpu, GitBranch, FileCode, Layers, Cog, BrainCircuit, FlaskConical, Table2, BookOpen, Sparkles, Flower2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const HeroCanvas = lazy(() => import('@/components/three/HeroCanvas'));

const modules = [
  { path: '/dfa', title: 'DFA Simulator', desc: 'Build and simulate Deterministic Finite Automata with visual state transitions.', icon: Cpu, color: '#E8459B' },
  { path: '/nfa', title: 'NFA & Subset Construction', desc: 'Explore non-determinism and convert NFAs to DFAs step-by-step.', icon: GitBranch, color: '#34D399' },
  { path: '/regex', title: 'Regular Expressions', desc: "Visualize Thompson's construction from regex to NFA.", icon: FileCode, color: '#F584BF' },
  { path: '/pda', title: 'Pushdown Automata', desc: 'Simulate PDAs with animated stack operations.', icon: Layers, color: '#F0A830' },
  { path: '/turing', title: 'Turing Machine', desc: 'Watch the tape dance as your TM computes.', icon: Cog, color: '#34D399' },
  { path: '/chomsky', title: 'Chomsky Hierarchy', desc: 'Interactive pyramid of formal grammar levels.', icon: BrainCircuit, color: '#E8459B' },
  { path: '/pumping', title: 'Pumping Lemma', desc: 'Prove languages are non-regular interactively.', icon: FlaskConical, color: '#F87171' },
  { path: '/cyk', title: 'CYK Parser', desc: 'Parse context-free grammars with animated tables.', icon: Table2, color: '#34D399' },
  { path: '/quiz', title: 'Quiz Mode', desc: 'Algorithmically generated quiz questions.', icon: BookOpen, color: '#F0A830' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-void" ref={containerRef}>
      <Navbar />

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div 
          className="absolute inset-0 z-0" 
          style={{ 
            backgroundImage: 'url(/forest-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.25,
            y: backgroundY
          }} 
        />

        {/* Layered radial gradients for depth */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 45%, rgba(232,69,155,0.15) 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 30% 70%, rgba(52,211,153,0.1) 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(240,168,48,0.1) 0%, transparent 60%)' }} />
        </div>

        <div className="absolute inset-0 bg-grid opacity-30 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[90vh] py-24">
            {/* Left: Text */}
            <motion.div
              style={{ y: textY }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                  bg-flora/10 text-flora-light border border-flora/20 mb-8"
              >
                <Flower2 size={14} />
                Interactive Theory of Computation
              </motion.div>

              <h1 className="font-display text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] text-text-primary leading-[1.05] mb-8 tracking-tight">
                <motion.span className="block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Formal</motion.span>
                <motion.span className="block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Languages,</motion.span>
                <motion.span className="block gradient-text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>Made Visual.</motion.span>
              </h1>

              <motion.p
                className="text-text-secondary text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              >
                Explore DFAs, NFAs, Turing Machines, and the Chomsky hierarchy through
                stunning interactive visualizations. Learn by doing.
              </motion.p>

              <motion.div className="flex flex-wrap gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Link to="/dfa">
                  <Button variant="primary" size="lg" className="text-base px-8 py-3.5">
                    Start Exploring
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/chomsky">
                  <Button variant="secondary" size="lg" className="text-base px-8 py-3.5">
                    View Hierarchy
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center gap-8 mt-14 text-sm text-text-muted"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
                  <span>9 Interactive Modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-flora animate-pulse" />
                  <span>Real-time Simulation</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: 3D Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-[500px] lg:h-[650px] hidden md:block relative"
            >
              {/* Glow halo behind canvas */}
              <div className="absolute inset-0 blur-3xl opacity-20" style={{
                background: 'radial-gradient(circle at 50% 50%, #E8459B 0%, transparent 50%)'
              }} />
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-flora/30 border-t-flora animate-spin mb-4" />
                    <p className="text-sm text-text-muted font-display">Blooming...</p>
                  </div>
                </div>
              }>
                <HeroCanvas />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(52,211,153,0.06) 0%, transparent 60%)'
        }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
              bg-emerald/10 text-emerald-light border border-emerald/20 mb-6">
              <Sparkles size={14} />
              Explore the Garden
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-5">
              Everything You Need to Master TOC
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
              From basic finite automata to Turing Machines — every concept blooms into
              interactive, visual understanding.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div key={mod.path} variants={itemVariants}>
                  <Link to={mod.path}>
                    <Card glow hover className="h-full group cursor-pointer min-h-[140px]">
                      <div className="flex items-start gap-4">
                        <div
                          className="p-3 rounded-2xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                          style={{ background: `${mod.color}12`, border: `1px solid ${mod.color}25`, boxShadow: `0 0 0 0 ${mod.color}00` }}
                        >
                          <Icon size={22} style={{ color: mod.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-text-primary mb-1.5 group-hover:text-flora-light transition-colors">
                            {mod.title}
                          </h3>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center gap-1.5 text-xs text-text-muted group-hover:text-flora-light transition-colors">
                        <span>Explore</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════ CHOMSKY TEASER ══════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(232,69,155,0.06) 0%, transparent 70%)'
        }} />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-8">
              The Chomsky Hierarchy
            </h2>
            <p className="text-text-secondary text-lg mb-12 max-w-2xl mx-auto">
              Discover the four levels of formal grammars — from regular to recursively enumerable —
              and how they relate to automata.
            </p>

            <div className="relative max-w-sm mx-auto mb-12">
              {[
                { label: 'Type 0 — Recursively Enumerable', color: '#E8459B' },
                { label: 'Type 1 — Context-Sensitive', color: '#F0A830' },
                { label: 'Type 2 — Context-Free', color: '#FBBF24' },
                { label: 'Type 3 — Regular', color: '#34D399' },
              ].map((band, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * (3 - i), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mb-3 rounded-xl py-3.5 text-sm font-medium text-text-primary border border-white/10 cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    width: `${100 - i * 18}%`,
                    background: `linear-gradient(135deg, ${band.color}15 0%, ${band.color}08 100%)`,
                    borderColor: `${band.color}30`,
                  }}
                >
                  {band.label}
                </motion.div>
              ))}
            </div>

            <Link to="/chomsky">
              <Button variant="secondary" size="lg" className="text-base px-8 py-3.5">
                Explore Hierarchy <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
