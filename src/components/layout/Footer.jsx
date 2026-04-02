import { Flower2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-void/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flora to-gold flex items-center justify-center shadow-lg shadow-flora/15">
              <Flower2 size={20} className="text-white" />
            </div>
            <div>
              <span className="font-display text-lg text-text-primary">AutomataVerse</span>
              <p className="text-xs text-text-muted">Where Formal Languages Bloom</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-text-secondary">
            <Link to="/dfa" className="hover:text-flora-light transition-colors">DFA</Link>
            <Link to="/nfa" className="hover:text-emerald-light transition-colors">NFA</Link>
            <Link to="/turing" className="hover:text-gold-light transition-colors">Turing</Link>
            <Link to="/chomsky" className="hover:text-flora-light transition-colors">Chomsky</Link>
          </div>

          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ExternalLink size={16} />
            <span>GitHub</span>
          </a>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-text-muted">
          © {new Date().getFullYear()} AutomataVerse — Built for CS education
        </div>
      </div>
    </footer>
  );
}
