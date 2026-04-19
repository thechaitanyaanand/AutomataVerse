import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Cpu, Binary, GitBranch, FileCode, Layers, Cog, FlaskConical, Table2, BookOpen, BrainCircuit, Flower2, CheckCircle2 } from 'lucide-react';
import useAppStore from '@/store/useAppStore';

const modules = [
  { path: '/dfa', label: 'DFA Simulator', icon: Cpu, color: '#E8459B' },
  { path: '/nfa', label: 'NFA & Subset Construction', icon: GitBranch, color: '#34D399' },
  { path: '/regex', label: 'Regular Expressions', icon: FileCode, color: '#F584BF' },
  { path: '/pda', label: 'Pushdown Automata', icon: Layers, color: '#F0A830' },
  { path: '/turing', label: 'Turing Machine', icon: Cog, color: '#34D399' },
  { path: '/chomsky', label: 'Chomsky Hierarchy', icon: BrainCircuit, color: '#E8459B' },
  { path: '/pumping', label: 'Pumping Lemma', icon: FlaskConical, color: '#F87171' },
  { path: '/cyk', label: 'CYK Parser', icon: Table2, color: '#34D399' },
  { path: '/quiz', label: 'Quiz', icon: BookOpen, color: '#F0A830' },
];

export default function Navbar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, closeSidebar, completedModules } = useAppStore();
  const [learnOpen, setLearnOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { closeSidebar(); setLearnOpen(false); }, [location.pathname, closeSidebar]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-void/85 backdrop-blur-2xl border-b border-emerald/15 shadow-lg shadow-void/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flora to-gold flex items-center justify-center shadow-lg shadow-flora/20 group-hover:shadow-flora/40 transition-shadow">
                <Flower2 size={20} className="text-white" />
              </div>
              <span className="font-display text-xl text-text-primary tracking-tight">
                AutomataVerse
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>

              <div className="relative" onMouseEnter={() => setLearnOpen(true)} onMouseLeave={() => setLearnOpen(false)}>
                <button className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname !== '/' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}>
                  Learn
                  <ChevronDown size={14} className={`transition-transform ${learnOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {learnOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 rounded-2xl overflow-hidden
                        bg-panel/95 backdrop-blur-2xl border border-emerald/15
                        shadow-2xl shadow-black/60"
                    >
                      <div className="p-2.5">
                        {modules.map((mod) => {
                          const Icon = mod.icon;
                          const isActive = location.pathname === mod.path;
                          const isComplete = completedModules?.includes(mod.path);
                          return (
                            <Link key={mod.path} to={mod.path}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                                isActive ? 'bg-flora/12 text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={16} style={{ color: mod.color }} />
                                <span>{mod.label}</span>
                              </div>
                              {isComplete && <CheckCircle2 size={16} className="text-flora" />}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/dfa"
                className="ml-3 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-flora to-flora-deep text-white hover:shadow-lg hover:shadow-flora/25 transition-all duration-300 cursor-target"
              >
                Start Learning
              </Link>
            </div>

            <button onClick={toggleSidebar} className="md:hidden p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={closeSidebar} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-panel border-l border-border p-6 md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl">Menu</span>
                <button onClick={closeSidebar} className="p-2 rounded-xl text-text-muted hover:text-text-primary"><X size={20} /></button>
              </div>
              <div className="space-y-1">
                <Link to="/" className="block px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">Home</Link>
                <div className="pt-3 pb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Modules</div>
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  const isComplete = completedModules?.includes(mod.path);
                  return (
                    <Link key={mod.path} to={mod.path}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                        location.pathname === mod.path ? 'bg-flora/12 text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} style={{ color: mod.color }} />
                        <span>{mod.label}</span>
                      </div>
                      {isComplete && <CheckCircle2 size={18} className="text-flora" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      active ? 'text-text-primary bg-white/5' : 'text-text-secondary hover:text-text-primary'
    }`}>{children}</Link>
  );
}
