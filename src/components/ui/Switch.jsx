import { clsx } from 'clsx';

export default function Switch({ checked, onChange, label, className }) {
  return (
    <label className={clsx('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50',
          checked ? 'bg-violet' : 'bg-border'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </label>
  );
}
