import { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { Search, X, Plus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../services/api';

export default function SmartSelect({ 
  value, 
  onChange, 
  endpoint, 
  placeholder = 'اختر...', 
  displayField = 'full_name',
  valueField = 'id',
  secondaryField = 'phone',
  addLabel = 'إضافة جديد',
  onAdd,
  onSelect,
  allowCustomValue = false,
  className 
}) {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef(null);
  const resourceEndpoint = endpoint?.split('?')[0];

  // جلب الخيارات
  useEffect(() => {
    const fetchOptions = async () => {
      if (!endpoint) return;
      setLoading(true);
      try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const { data } = await api.get(`${endpoint}${separator}search=${encodeURIComponent(search)}&per_page=20`);
        setOptions(data.data || data);
      } catch {
        setOptions([]);
      }
      setLoading(false);
    };
    
    const timer = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timer);
  }, [search, endpoint]);

  // جلب القيمة المحددة عند تحميل المكون
  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(null);
      return;
    }

    if (selected && String(selected[valueField]) === String(value)) {
      return;
    }

    if (valueField === 'id' && resourceEndpoint) {
      api.get(`${resourceEndpoint}/${value}`).then(({ data }) => {
        setSelected(data.data || data);
      }).catch(() => {});
    }
  }, [value, valueField, resourceEndpoint, selected]);

  // إغلاق عند النقر خارج المكون
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    onChange(item[valueField]);
    onSelect?.(item);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null);
    onSelect?.(null);
    setSearch('');
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* عرض المختار */}
      {selected ? (
        <div className="flex items-center justify-between w-full h-11 bg-white border-2 border-[#E9E5E3] rounded-2xl px-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-[#132D42] truncate">{selected[displayField]}</span>
            {selected[secondaryField] && (
              <span className="text-xs text-[#7E8991] truncate">{selected[secondaryField]}</span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="text-[#A09E9B] hover:text-[#C85C5C]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09E9B]" />
          <Input
            value={allowCustomValue ? (search || value || '') : search}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSearch(nextValue);
              if (allowCustomValue) onChange(nextValue);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pr-10 bg-white"
          />
        </div>
      )}

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E9E5E3] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          {loading && <div className="p-4 text-center text-sm text-[#7E8991]">جاري التحميل...</div>}
          
          {!loading && options.length === 0 && (
            <div className="p-4 text-center text-sm text-[#7E8991]">
              لا توجد نتائج
              {onAdd && (
                <button onClick={() => { onAdd(); setIsOpen(false); }} className="block w-full mt-2 text-[#153751] font-medium hover:bg-[#F2EFEE] rounded-xl p-2">
                  <Plus className="w-4 h-4 inline ml-1" /> {addLabel}
                </button>
              )}
            </div>
          )}

          {!loading && options.map((item) => (
            <button
              key={item[valueField]}
              type="button"
              onClick={() => handleSelect(item)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F2EFEE] transition-colors',
                item[valueField] === value && 'bg-[#153751]/5'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-[#132D42] truncate">{item[displayField]}</span>
                {item[secondaryField] && (
                  <span className="text-xs text-[#7E8991] truncate">{item[secondaryField]}</span>
                )}
              </div>
              {item[valueField] === value && <Check className="w-4 h-4 text-[#153751] shrink-0" />}
            </button>
          ))}

          {onAdd && options.length > 0 && (
            <button
              onClick={() => { onAdd(); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#153751] font-medium hover:bg-[#F2EFEE] border-t border-[#E9E5E3] transition-colors"
            >
              <Plus className="w-4 h-4" /> {addLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
