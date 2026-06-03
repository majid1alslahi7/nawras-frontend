import { cn } from '../../lib/utils';

const logoSizes = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

export default function NawrasLogo({ size = 'md', className }) {
  return (
    <img
      src="/brand/nawras-logo-circle.webp"
      alt="شعار عيادة النورس"
      draggable="false"
      className={cn(
        'shrink-0 rounded-full object-cover shadow-[0_10px_28px_rgba(19,45,66,0.18)] ring-1 ring-[#D8D2CA]',
        logoSizes[size] || logoSizes.md,
        className
      )}
    />
  );
}
