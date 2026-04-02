import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                  w-full max-w-md rounded-2xl p-6
                  bg-panel border border-border
                  shadow-2xl shadow-black/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <DialogPrimitive.Title className="text-lg font-semibold text-text-primary font-display">
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <button className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
                      <X size={18} />
                    </button>
                  </DialogPrimitive.Close>
                </div>
                <DialogPrimitive.Description className="sr-only">
                  {title} dialog content
                </DialogPrimitive.Description>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </AnimatePresence>
  );
}
