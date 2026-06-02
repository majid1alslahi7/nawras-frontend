import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Plus, TrendingUp, TrendingDown, Banknote, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import api from '../../services/api';

export default function TransactionsPage() {
  const [filter, setFilter] = useState('today');
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [form, setForm] = useState({ category_id: '', patient_id: '', amount: '', payment_method: 'نقدي', description: '', notes: '' });

  const { data: daily } = useGetQuery('transactions-daily', '/transactions/summary/daily');
  const { data: incomeReceipts } = useGetQuery('receipts-income', '/receipts/income');
  const { data: expenseReceipts } = useGetQuery('receipts-expense', '/receipts/expense');
  const { data: transactions } = useGetQuery(['transactions', { filter }], `/transactions?filter=${filter}&per_page=50`);

  const createTransaction = useMutate('post', '/transactions', {
    invalidate: ['transactions', 'receipts-income', 'receipts-expense', 'transactions-daily'],
    successMessage: 'تم تسجيل المعاملة بنجاح',
    onSuccess: () => { setShowModal(false); setForm({ category_id: '', patient_id: '', amount: '', payment_method: 'نقدي', description: '', notes: '' }); },
  });

  const openModal = (type) => { setModalType(type); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTransaction.mutate({ ...form, type: modalType === 'income' ? 'إيراد' : 'مصروف', amount: Number(form.amount) });
  };

  const handlePrint = (id) => window.open(`https://nawrasb.alssemam.com/api/transactions/${id}/receipt`, '_blank');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">المالية</h1><p className="text-[#7E8991] mt-1">المعاملات المالية وسندات القبض والصرف</p></div>
        <div className="flex gap-2">
          <Button icon={TrendingUp} variant="success" onClick={() => openModal('income')}>إيراد جديد</Button>
          <Button icon={TrendingDown} variant="danger" onClick={() => openModal('expense')}>مصروف جديد</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#2E8B73]/8 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#2E8B73]" /></div><div><p className="text-sm text-[#7E8991]">إيرادات اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.total_income || 0)}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#C85C5C]/8 rounded-2xl flex items-center justify-center"><TrendingDown className="w-6 h-6 text-[#C85C5C]" /></div><div><p className="text-sm text-[#7E8991]">مصروفات اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.total_expense || 0)}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#153751]/8 rounded-2xl flex items-center justify-center"><Banknote className="w-6 h-6 text-[#153751]" /></div><div><p className="text-sm text-[#7E8991]">صافي الربح اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.net_profit || 0)}</p></div></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2">
        {['all', 'income', 'expense'].map((key) => (
          <Button key={key} variant={tab === key ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(key)}>
            {key === 'all' ? 'الكل' : key === 'income' ? 'سندات القبض' : 'سندات الصرف'}
          </Button>
        ))}
      </div>

      {tab === 'income' && <TransactionList data={incomeReceipts?.data} onPrint={handlePrint} />}
      {tab === 'expense' && <TransactionList data={expenseReceipts?.data} onPrint={handlePrint} />}
      {tab === 'all' && <TransactionList data={transactions?.data} onPrint={handlePrint} />}

      {/* نموذج إضافة معاملة */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalType === 'income' ? 'تسجيل إيراد جديد' : 'تسجيل مصروف جديد'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف *</label>
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">اختر التصنيف...</option>
              {/* سنستخدم قائمة ثابتة لضمان العمل */}
              <option value="1">كشف طبي</option><option value="2">كشف متابعة</option>
              <option value="8">إيجار العيادة</option><option value="10">مستلزمات طبية</option>
            </Select>
          </div>
          {modalType === 'income' && (
            <div>
              <label className="block text-sm font-medium mb-1">المريض</label>
              <Input value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} placeholder="معرف المريض (اختياري)" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ *</label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
              <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="نقدي">نقدي</option><option value="بطاقة ائتمان">بطاقة ائتمان</option><option value="تحويل بنكي">تحويل بنكي</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button type="submit" loading={createTransaction.isLoading}>حفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TransactionList({ data, onPrint }) {
  if (!data || data.length === 0) return <p className="text-center text-[#7E8991] py-8">لا توجد معاملات</p>;
  return (
    <div className="space-y-2">
      {data.map((txn) => (
        <Card key={txn.id} hover>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#132D42]">{txn.category?.name_ar || txn.description || 'معاملة'}</p>
              <p className="text-xs text-[#7E8991]">{formatDate(txn.transaction_date)} {txn.patient?.full_name ? `- ${txn.patient.full_name}` : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${txn.type === 'إيراد' ? 'text-[#2E8B73]' : 'text-[#C85C5C]'}`}>
                {txn.type === 'إيراد' ? '+' : '-'}{formatCurrency(txn.total_amount)}
              </span>
              <Button variant="ghost" size="sm" icon={Printer} onClick={() => onPrint(txn.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
