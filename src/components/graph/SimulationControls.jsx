import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Zap } from 'lucide-react';

export default function SimulationControls({
  simulation,
  speed,
  isPlaying,
  onStepForward,
  onStepBackward,
  onReset,
  onTogglePlay,
  onSpeedChange,
}) {
  const currentStep = simulation?.currentStep ?? 0;
  const totalSteps = simulation?.steps?.length ?? 0;
  const status = simulation?.status ?? 'idle';
  const step = simulation?.steps?.[currentStep];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {simulation && (
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet to-cyan transition-all duration-300 rounded-full"
            style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="icon" onClick={onReset} disabled={!simulation}>
          <RotateCcw size={16} />
        </Button>
        <Button variant="icon" onClick={onStepBackward} disabled={!simulation || currentStep <= 0}>
          <SkipBack size={16} />
        </Button>
        <Button
          variant="primary"
          onClick={onTogglePlay}
          disabled={!simulation || status === 'done'}
          className="px-5"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Button variant="icon" onClick={onStepForward} disabled={!simulation || status === 'done'}>
          <SkipForward size={16} />
        </Button>
      </div>

      {/* Speed slider */}
      <Slider
        label="Speed"
        value={speed}
        onValueChange={onSpeedChange}
        min={50}
        max={2000}
        step={50}
      />

      {/* Step info */}
      {simulation && step && (
        <div className="text-center space-y-1">
          <div className="text-xs text-text-muted font-mono">
            Step {currentStep} / {totalSteps - 1}
          </div>
          {step.phase === 'done' || step.phase === 'accepted' || step.phase === 'rejected' ? (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              step.accepted || step.phase === 'accepted'
                ? 'bg-success/20 text-success'
                : 'bg-danger/20 text-danger'
            }`}>
              <Zap size={14} />
              {step.accepted || step.phase === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
            </div>
          ) : step.symbol !== undefined ? (
            <div className="text-sm text-text-secondary">
              Reading '<span className="text-cyan-light font-mono">{step.symbol}</span>'
              {step.state && <> → State <span className="text-violet-light font-mono">{step.state}</span></>}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
