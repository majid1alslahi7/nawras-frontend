import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-[#153751]/8 text-[#153751]',
  success: 'bg-[#2E8B73]/10 text-[#2E8B73]',
  warning: 'bg-[#C89B3C]/10 text-[#C89B3C]',
  danger: 'bg-[#C85C5C]/10 text-[#C85C5C]',
  info: 'bg-[#1E5A78]/10 text-[#1E5A78]',
  muted: 'bg-[#F2EFEE] text-[#7E8991]',
};

export function Badge({ children, className, variant = 'default', ...props }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
