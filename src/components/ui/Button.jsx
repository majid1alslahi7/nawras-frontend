import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({ children, className, variant = 'primary', size = 'md', loading, disabled, icon: Icon, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#153751] text-white hover:bg-[#0F2B40] shadow-lg shadow-[#153751]/20 hover:shadow-xl active:scale-[0.98]',
    outline: 'border-2 border-[#E9E5E3] text-[#132D42] hover:border-[#153751] hover:text-[#153751] hover:bg-[#153751]/3',
    ghost: 'text-[#7E8991] hover:text-[#132D42] hover:bg-[#F2EFEE]',
    danger: 'bg-[#C85C5C] text-white hover:bg-[#b04d4d] shadow-lg shadow-[#C85C5C]/20',
    success: 'bg-[#2E8B73] text-white hover:bg-[#247a63] shadow-lg shadow-[#2E8B73]/20',
  };
  const sizes = { sm: 'h-9 px-4 text-sm rounded-xl', md: 'h-11 px-6 text-sm rounded-2xl', lg: 'h-12 px-8 text-base rounded-2xl', icon: 'h-11 w-11 rounded-2xl' };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
