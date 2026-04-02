import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 rounded-xl text-sm',
          'bg-void border border-border text-text-primary',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet/50',
          'transition-all duration-200',
          error && 'border-danger focus:border-danger focus:ring-danger/50',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
