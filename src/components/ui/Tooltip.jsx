import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export default function Tooltip({ children, content, side = 'top' }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-50 rounded-lg px-3 py-1.5 text-xs font-medium
              bg-panel border border-border text-text-primary
              shadow-xl shadow-black/50 backdrop-blur-xl
              animate-in fade-in-0 zoom-in-95"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-panel" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
