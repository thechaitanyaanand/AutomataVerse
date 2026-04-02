import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-flora to-flora-deep text-white shadow-lg shadow-flora/20 hover:shadow-flora/35 hover:brightness-110',
  secondary: 'glass text-text-primary hover:bg-white/10 hover:border-emerald/20',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-danger/15 text-danger border border-danger/25 hover:bg-danger/25',
  icon: 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10 p-2.5',
  success: 'bg-success/15 text-success border border-success/25 hover:bg-success/25',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-2xl',
};

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className, disabled, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-flora focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        variant !== 'icon' && sizes[size],
        variant === 'icon' && 'rounded-xl',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
