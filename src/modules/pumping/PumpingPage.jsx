import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/layout/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import MathDisplay from '@/components/ui/MathDisplay';
import { BUILTIN_LANGUAGES, verifyPumpingDecomposition, generatePumpingChallenge } from '@/lib/pumping';
import useAppStore from '@/store/useAppStore';
import { fireConfetti } from '@/lib/confetti';
import { audio } from '@/lib/audio';

export default function PumpingPage() {
  const [langId, setLangId] = useState('a_n_b_n');
  const [challenge, setChallenge] = useState(null);
  const [xLen, setXLen] = useState(0);
  const [yLen, setYLen] = useState(1);
  const [pumpI, setPumpI] = useState(2);
  const [result, setResult] = useState(null);
  const completeModule = useAppStore(state => state.completeModule);

  const langOptions = BUILTIN_LANGUAGES.map(l => ({ value: l.id, label: `${l.display} — ${l.description}` }));

  const startChallenge = () => {
    const ch = generatePumpingChallenge(langId);
    setChallenge(ch);
    setXLen(0); setYLen(1); setResult(null);
  };

  const verify = () => {
    if (!challenge) return;
    const w = challenge.word;
    const x = w.slice(0, xLen);
    const y = w.slice(xLen, xLen + yLen);
    const z = w.slice(xLen + yLen);
    const res = verifyPumpingDecomposition(langId, challenge.pumpingLength, w, { x, y, z });
    setResult(res);
    if (res.valid) {
      audio.playSuccess();
      fireConfetti();
      completeModule('/pumping');
    } else {
      audio.playError();
    }
  };

  const word = challenge?.word || '';
  const x = word.slice(0, xLen);
  const y = word.slice(xLen, xLen + yLen);
  const z = word.slice(xLen + yLen);
  const pumped = x + y.repeat(pumpI) + z;

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-10 w-full">
          <SectionHeader title="Pumping Lemma" subtitle="Prove languages are non-regular using contradiction" badge="Proof Tool" />

          <Card className="mb-6">
            <MathDisplay math="\forall p \geq 1, \exists w \in L, |w| \geq p : w = xyz, |y| \geq 1, |xy| \leq p, \forall i \geq 0 : xy^iz \in L" block />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <Select label="Language" value={langId} onChange={setLangId} options={langOptions} />
              <Button onClick={startChallenge} className="w-full mt-4">Generate Challenge</Button>
              {challenge && <p className="text-xs text-text-muted mt-2">{challenge.hint}</p>}
            </Card>

            {challenge && (
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-2">p = {challenge.pumpingLength}</h3>
                <p className="text-sm text-text-secondary mb-3">w = "{word}" (length {word.length})</p>
                <div className="flex gap-0 font-mono text-lg mb-4 flex-wrap">
                  {word.split('').map((c, i) => {
                    let color = 'text-text-muted';
                    if (i < xLen) color = 'text-text-secondary';
                    else if (i < xLen + yLen) color = 'text-violet-light';
                    else color = 'text-cyan-light';
                    return <span key={i} className={color}>{c}</span>;
                  })}
                </div>
                <div className="flex gap-2 text-xs mb-2">
                  <Badge variant="muted">x = "{x}"</Badge>
                  <Badge variant="default">y = "{y}"</Badge>
                  <Badge variant="cyan">z = "{z}"</Badge>
                </div>
                <div className="space-y-3">
                  <Input label={`x length (0-${word.length - 1})`} type="number" value={xLen} onChange={e => setXLen(Math.max(0, Math.min(word.length - 1, +e.target.value)))} />
                  <Input label={`y length (1-${word.length - xLen})`} type="number" value={yLen} onChange={e => setYLen(Math.max(1, Math.min(word.length - xLen, +e.target.value)))} />
                  <Input label="Pump i" type="number" value={pumpI} onChange={e => setPumpI(Math.max(0, +e.target.value))} />
                </div>
                <p className="text-xs text-text-muted mt-2 font-mono">xy{'\u00B9'}z = "{pumped}"</p>
                <Button onClick={verify} className="w-full mt-3">Verify Decomposition</Button>

                {result && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 p-3 rounded-xl border ${result.valid ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                    {result.valid ? (
                      <div className="text-sm text-success">✓ Contradiction found! {result.witness.reason}</div>
                    ) : (
                      <div className="text-sm text-danger">✗ {result.error}</div>
                    )}
                  </motion.div>
                )}
              </Card>
            )}
          </div>
        </div>
        <Footer />
      </PageWrapper>
    </>
  );
}


