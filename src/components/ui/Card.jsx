import { cn } from '../../lib/utils';
import React from 'react';

const Card = React.forwardRef(({ className, hover, ...props }, ref) => (
  <div ref={ref} className={cn('bg-white border border-[#E9E5E3] rounded-3xl transition-all duration-300', hover && 'hover:shadow-[0_16px_45px_rgba(19,45,66,0.08)] hover:-translate-y-0.5', className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-bold text-[#132D42]', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
