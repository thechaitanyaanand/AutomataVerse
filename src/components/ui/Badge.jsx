import { clsx } from 'clsx';

const badgeVariants = {
  default: 'bg-violet/20 text-violet-light border-violet/30',
  success: 'bg-success/20 text-success border-success/30',
  danger: 'bg-danger/20 text-danger border-danger/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  cyan: 'bg-cyan/20 text-cyan-light border-cyan/30',
  muted: 'bg-white/5 text-text-secondary border-white/10',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  );
}
