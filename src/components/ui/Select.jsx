import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'w-full h-11 bg-white border-2 border-[#E9E5E3] rounded-2xl px-4 text-sm text-[#132D42] appearance-none transition-all duration-200 focus:border-[#1E5A78] focus:shadow-[0_0_0_4px_rgba(30,90,120,0.08)] outline-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09E9B] pointer-events-none" />
  </div>
));
Select.displayName = 'Select';
export { Select };
