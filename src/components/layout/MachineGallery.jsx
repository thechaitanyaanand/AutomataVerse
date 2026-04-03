import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FolderOpen, Trash2, Plus, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { clsx } from 'clsx';
import { audio } from '@/lib/audio';

export default function MachineGallery({ type, onGetSnapshot, onLoadSnapshot }) {
  const { savedMachines, saveMachine, deleteMachine } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const myMachines = savedMachines.filter((m) => m.type === type);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const snapshot = onGetSnapshot();
    if (!snapshot) return;
    saveMachine({ type, name: saveName.trim(), snapshot });
    audio.playSuccess();
    setSaveName('');
    setSaving(false);
  };

  const handleLoad = (machine) => {
    onLoadSnapshot(machine.snapshot);
    audio.playTick();
  };

  const handleDelete = (id) => {
    deleteMachine(id);
  };

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-cyan-light" />
          <span className="text-sm font-semibold text-text-primary">My Gallery</span>
          {myMachines.length > 0 && (
            <span className="text-xs bg-cyan/20 text-cyan-light px-1.5 py-0.5 rounded-full font-mono">
              {myMachines.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {/* Save current */}
              <AnimatePresence>
                {saving ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="e.g., My DFA v1"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSave} disabled={!saveName.trim()}>
                      <Save size={14} /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSaving(false)}>
                      Cancel
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full border border-dashed border-white/20 hover:border-white/40"
                    onClick={() => setSaving(true)}
                  >
                    <Plus size={14} />
                    Save Current Machine
                  </Button>
                )}
              </AnimatePresence>

              {/* Saved list */}
              {myMachines.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No saved machines yet.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {myMachines.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen size={14} className="text-cyan-light shrink-0" />
                        <span className="text-sm text-text-primary truncate">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleLoad(m)}
                          className="text-xs text-cyan-light hover:text-cyan font-medium px-2 py-0.5 rounded-md hover:bg-cyan/10 transition-all"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-text-muted hover:text-danger transition-colors p-0.5 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
