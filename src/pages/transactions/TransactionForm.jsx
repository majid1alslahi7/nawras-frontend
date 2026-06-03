import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight } from 'lucide-react';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { type } = useParams();
  const defaultType = type === 'expense' ? 'مصروف' : 'إيراد';
  const [form, setForm] = useState({
    category_id: '', type: defaultType, amount: '', discount: '0', tax: '0',
    payment_method: 'نقدي', description: '', patient_id: '', visit_id: '', notes: '',
  });

  const { data: categories } = useGetQuery('categories', '/categories');

  const saveTransaction = useMutate('post', '/transactions', {
    successMessage: 'تم تسجيل المعاملة بنجاح',
    onSuccess: () => navigate('/transactions'),
  });

  const totalAmount = (Number(form.amount) || 0) - (Number(form.discount) || 0) + (Number(form.tax) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveTransaction.mutate({
      ...form,
      receipt_type: form.type === 'إيراد' ? 'income_receipt' : 'expense_receipt',
      total_amount: totalAmount,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/transactions')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">معاملة مالية جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">تفاصيل المعاملة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">النوع *</label>
                <Select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="إيراد">إيراد</option><option value="مصروف">مصروف</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف *</label>
                <Select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">اختر...</option>
                  {categories?.filter(c => c.type === form.type).map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </Select>
              </div>
              <div><label className="block text-sm font-medium mb-1">المبلغ *</label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div>
                <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
                <Select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                  <option value="نقدي">نقدي</option><option value="بطاقة ائتمان">بطاقة ائتمان</option><option value="تحويل بنكي">تحويل بنكي</option><option value="محفظة إلكترونية">محفظة إلكترونية</option>
                </Select>
              </div>
              <div><label className="block text-sm font-medium mb-1">الخصم</label><Input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">الضريبة</label><Input type="number" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">المريض (اختياري)</label><SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(val) => setForm({...form, patient_id: val})} placeholder="اختر مريض..." displayField="full_name" valueField="id" /></div>
              <div className="flex items-end"><div className="w-full p-3 bg-[#153751]/5 rounded-2xl text-center"><p className="text-xs text-[#7E8991]">الإجمالي النهائي</p><p className="text-xl font-bold text-[#153751]">{totalAmount.toLocaleString('ar-SA')} ﷼</p></div></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">الوصف</label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="وصف المعاملة..." /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/transactions')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={saveTransaction.isLoading}>حفظ</Button>
        </div>
      </form>
    </div>
  );
}
