import { clsx } from 'clsx';

export default function Select({ label, value, onChange, options, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'w-full px-3 py-2 rounded-xl text-sm appearance-none cursor-pointer',
          'bg-void border border-border text-text-primary',
          'focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet/50',
          'transition-all duration-200',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239090B0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E")]',
          'bg-no-repeat bg-[center_right_0.75rem]',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
