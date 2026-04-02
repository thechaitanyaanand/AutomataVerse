import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function Card({ children, className, glow = false, hover = true, padding = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'rounded-2xl border border-white/[0.06] overflow-hidden',
        'bg-white/[0.02] backdrop-blur-xl',
        'shadow-xl shadow-black/40',
        padding && 'p-6',
        hover && 'transition-all duration-400',
        hover && 'hover:border-emerald/15 hover:bg-white/[0.04]',
        glow && 'hover:shadow-flora/10 hover:shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
