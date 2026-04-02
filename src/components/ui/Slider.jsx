import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx } from 'clsx';

export default function Slider({ value, onValueChange, min = 0, max = 100, step = 1, label, className }) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-text-secondary">{label}</label>
          <span className="text-xs text-text-muted font-mono">{value}</span>
        </div>
      )}
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={(v) => onValueChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center w-full h-5 select-none touch-none"
      >
        <SliderPrimitive.Track className="relative h-1 w-full rounded-full bg-border overflow-hidden">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-violet to-cyan" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-4 h-4 rounded-full bg-white border-2 border-violet
            shadow-lg shadow-violet/30 hover:shadow-violet/50
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50
            transition-shadow"
        />
      </SliderPrimitive.Root>
    </div>
  );
}
