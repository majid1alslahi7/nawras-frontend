import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => (
  <div className="relative">
    {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" />}
    <input
      ref={ref}
      className={cn(
        'w-full h-11 bg-white border-2 border-[#E9E5E3] rounded-2xl px-4 text-sm text-[#132D42] placeholder:text-[#A09E9B] transition-all duration-200 focus:border-[#1E5A78] focus:shadow-[0_0_0_4px_rgba(30,90,120,0.08)] outline-none',
        Icon && 'pr-11',
        className
      )}
      {...props}
    />
  </div>
));
Input.displayName = 'Input';
export { Input };
