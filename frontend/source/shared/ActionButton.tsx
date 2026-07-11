import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ActionButtonVariant = 'primary' | 'outline';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
}

const variantClasses: Record<ActionButtonVariant, string> = {
  primary:
    'border border-magma-ember bg-magma-ember/15 text-magma-glow hover:bg-magma-ember/25',
  outline: 'border border-white/20 text-neutral-300 hover:border-white/40 hover:bg-white/5',
};

export function ActionButton({
  variant = 'primary',
  className,
  children,
  ...buttonProps
}: ActionButtonProps) {
  return (
    <button
      className={clsx(
        'px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        className
      )}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
