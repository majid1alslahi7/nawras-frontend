import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export default function Modal({ open, onClose, title, children, size = 'md', className }) {
  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#0F2B40]/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto', sizes[size], className)}>
        <div className="sticky top-0 bg-white/90 backdrop-blur flex items-center justify-between p-6 border-b border-[#E9E5E3] rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-[#132D42]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} icon={X} />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
