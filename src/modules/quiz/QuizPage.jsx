import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, X, Trophy } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';
import { DFA } from '@/lib/dfa';

function generateRandomDFA() {
  const n = 2 + Math.floor(Math.random() * 3);
  const states = Array.from({ length: n }, (_, i) => `q${i}`);
  const alphabet = ['0', '1'];
  const trans = new Map();
  for (const s of states) {
    for (const a of alphabet) {
      trans.set(`${s},${a}`, states[Math.floor(Math.random() * n)]);
    }
  }
  const acceptCount = 1 + Math.floor(Math.random() * 2);
  const accept = [];
  const shuffled = [...states].sort(() => Math.random() - 0.5);
  for (let i = 0; i < acceptCount && i < states.length; i++) accept.push(shuffled[i]);
  return new DFA(states, alphabet, trans, 'q0', accept);
}

function generateQuestion() {
  const types = ['accept_string', 'count_states', 'is_regular', 'accept_empty', 'identify_lang'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'accept_string') {
    const dfa = generateRandomDFA();
    const str = Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => Math.random() > 0.5 ? '1' : '0').join('');
    const steps = [...dfa.simulate(str)];
    const accepted = steps[steps.length - 1].accepted;
    return { type, question: `Does the DFA accept "${str}"?`, dfa, string: str, answer: accepted ? 'Yes' : 'No', options: ['Yes', 'No'] };
  }
  if (type === 'count_states') {
    const n = 2 + Math.floor(Math.random() * 5);
    return { type, question: `If a DFA has ${n} states, what is the minimum number of transitions for a complete DFA over alphabet {0,1}?`, answer: `${n * 2}`, options: [`${n}`, `${n * 2}`, `${n * 3}`, `${2 ** n}`] };
  }
  if (type === 'is_regular') {
    const langs = [
      { lang: 'aⁿbⁿ', regular: false },
      { lang: 'a*b*', regular: true },
      { lang: '(ab)*', regular: true },
      { lang: 'ww^R', regular: false },
      { lang: '0*1*0*', regular: true },
    ];
    const pick = langs[Math.floor(Math.random() * langs.length)];
    return { type, question: `Is the language L = {${pick.lang}} regular?`, answer: pick.regular ? 'Yes' : 'No', options: ['Yes', 'No'] };
  }
  if (type === 'accept_empty') {
    const dfa = generateRandomDFA();
    const stepsEmpty = [...dfa.simulate('')];
    const accepted = stepsEmpty[stepsEmpty.length - 1].accepted;
    return { type, question: 'Does this DFA accept the empty string ε?', dfa, answer: accepted ? 'Yes' : 'No', options: ['Yes', 'No'] };
  }
  // identify_lang
  const answers = ['Strings ending in 01', 'Strings with even 0s', 'Strings divisible by 3', 'All binary strings'];
  return { type, question: 'What language does a DFA with a single accept state q0 (which is also the start state) and all self-loops recognize?', answer: answers[3], options: answers };
}

export default function QuizPage() {
  const { quizScore, addQuizScore, resetQuizScore } = useAppStore();
  const [questions, setQuestions] = useState(() => Array.from({ length: 5 }, generateQuestion));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const current = questions[currentIdx];

  const handleAnswer = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    setTotal(t => t + 1);
    if (option === current.answer) {
      setCorrect(c => c + 1);
      addQuizScore(10);
      audio.playSuccess();
    } else {
      audio.playError();
    }
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      audio.playTick();
      setCurrentIdx(i => i + 1);
    } else {
      if (correct === questions.length) {
        fireConfetti();
      }
      setQuestions(Array.from({ length: 5 }, generateQuestion));
      setCurrentIdx(0);
      useAppStore.getState().completeModule('/quiz');
    }
    setSelected(null);
    setAnswered(false);
  };

  const reset = () => {
    setQuestions(Array.from({ length: 5 }, generateQuestion));
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
    setCorrect(0);
    setTotal(0);
    resetQuizScore();
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader title="Quiz Mode" subtitle="Test your TOC knowledge" badge="Challenge" />

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="text-center"><div className="text-2xl font-bold text-violet-light">{quizScore}</div><div className="text-xs text-text-muted">Score</div></Card>
            <Card className="text-center"><div className="text-2xl font-bold text-success">{correct}</div><div className="text-xs text-text-muted">Correct</div></Card>
            <Card className="text-center"><div className="text-2xl font-bold text-text-primary">{total}</div><div className="text-xs text-text-muted">Answered</div></Card>
            <Card className="text-center"><div className="text-2xl font-bold text-cyan-light">{total > 0 ? Math.round((correct / total) * 100) : 0}%</div><div className="text-xs text-text-muted">Accuracy</div></Card>
          </div>

          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="cyan">Q{currentIdx + 1} / {questions.length}</Badge>
              <Button variant="ghost" size="sm" onClick={reset}><RefreshCw size={14} /> Reset</Button>
            </div>
            <div className="w-full bg-border rounded-full h-1 mb-6">
              <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-6">{current?.question}</h3>
            <div className="space-y-3">
              {current?.options.map((opt) => {
                let cls = 'border-white/10 hover:border-white/20 bg-white/[0.02]';
                if (answered && opt === current.answer) cls = 'border-success/40 bg-success/10';
                else if (answered && opt === selected && opt !== current.answer) cls = 'border-danger/40 bg-danger/10';
                return (
                  <motion.button key={opt} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(opt)} disabled={answered} className={`w-full text-left px-4 py-3 rounded-xl border text-sm text-text-primary transition-all ${cls}`}>
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {answered && opt === current.answer && <Check size={16} className="text-success" />}
                      {answered && opt === selected && opt !== current.answer && <X size={16} className="text-danger" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <Button onClick={next} className="w-full">{currentIdx < questions.length - 1 ? 'Next Question' : 'New Round'}</Button>
              </motion.div>
            )}
          </Card>
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


