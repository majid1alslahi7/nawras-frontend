import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) { return twMerge(clsx(inputs)); }

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount) {
  return `${Number(amount).toLocaleString('ar-SA')} ﷼`;
}

export function formatTime(time) {
  if (!time) return '';
  return time?.substring(0, 5);
}

export const statusStyles = {
  'مؤكد': 'bg-[#284861]/10 text-[#284861]',
  'قيد الانتظار': 'bg-[#C89B3C]/10 text-[#C89B3C]',
  'حضر': 'bg-[#2E8B73]/10 text-[#2E8B73]',
  'جاري الكشف': 'bg-[#1E5A78]/10 text-[#1E5A78]',
  'مكتمل': 'bg-[#2E8B73]/10 text-[#2E8B73]',
  'ملغى': 'bg-[#C85C5C]/10 text-[#C85C5C]',
  'لم يحضر': 'bg-[#7E8991]/10 text-[#7E8991]',
  'فحوصات مطلوبة': 'bg-[#C89B3C]/10 text-[#C89B3C]',
  'في انتظار النتائج': 'bg-[#284861]/10 text-[#284861]',
  'نتائج جاهزة': 'bg-[#2E8B73]/10 text-[#2E8B73]',
  'قيد الكشف': 'bg-[#1E5A78]/10 text-[#1E5A78]',
  'مطلوب': 'bg-[#C89B3C]/10 text-[#C89B3C]',
  'تم التسليم': 'bg-[#2E8B73]/10 text-[#2E8B73]',
  'منتهي': 'bg-[#7E8991]/10 text-[#7E8991]',
};

export const paymentLabels = {
  'نقدي': 'نقدي',
  'بطاقة ائتمان': 'بطاقة',
  'تحويل بنكي': 'تحويل',
  'شيك': 'شيك',
  'محفظة إلكترونية': 'محفظة',
};

export const paymentIcons = {
  'نقدي': 'Banknote',
  'بطاقة ائتمان': 'CreditCard',
  'تحويل بنكي': 'ArrowRightLeft',
  'شيك': 'ScrollText',
  'محفظة إلكترونية': 'Wallet',
};
