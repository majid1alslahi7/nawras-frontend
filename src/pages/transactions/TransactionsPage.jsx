import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import SmartSelect from '../../components/ui/SmartSelect';
import { TrendingUp, TrendingDown, Banknote, Printer, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { openApiFile } from '../../lib/downloads';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const filter = 'today';
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [form, setForm] = useState({ category_id: '', patient_id: '', amount: '', payment_method: 'نقدي', description: '', notes: '' });

  const { data: categories } = useGetQuery('categories', '/categories');
  const { data: daily } = useGetQuery('transactions-daily', '/transactions/summary/daily');
  const { data: incomeReceipts } = useGetQuery('receipts-income', '/receipts/income');
  const { data: expenseReceipts } = useGetQuery('receipts-expense', '/receipts/expense');
  const { data: transactions } = useGetQuery(['transactions', { filter }], `/transactions?filter=${filter}&per_page=50`);

  const createTransaction = useMutate('post', '/transactions', {
    invalidate: ['transactions', 'receipts-income', 'receipts-expense', 'transactions-daily'],
    successMessage: 'تم تسجيل المعاملة بنجاح',
    onSuccess: () => { setShowModal(false); setForm({ category_id: '', patient_id: '', amount: '', payment_method: 'نقدي', description: '', notes: '' }); },
  });

  const openModal = (type) => {
    setModalType(type);
    setForm({ category_id: '', patient_id: '', amount: '', payment_method: 'نقدي', description: '', notes: '' });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTransaction.mutate({
      ...form,
      type: modalType === 'income' ? 'إيراد' : 'مصروف',
      receipt_type: modalType === 'income' ? 'income_receipt' : 'expense_receipt',
      amount: Number(form.amount),
    });
  };

  const handlePrint = (id) => {
    openApiFile(`/transactions/${id}/receipt`, `receipt-${id}.pdf`)
      .catch(() => toast.error('تعذرت طباعة السند'));
  };

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
              {categories?.filter((category) => category.type === (modalType === 'income' ? 'إيراد' : 'مصروف')).map((category) => (
                <option key={category.id} value={category.id}>{category.name_ar}</option>
              ))}
            </Select>
          </div>
          {modalType === 'income' && (
            <div>
              <label className="block text-sm font-medium mb-1">المريض</label>
              <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(value) => setForm({ ...form, patient_id: value })} placeholder="ابحث عن مريض..." displayField="full_name" valueField="id" secondaryField="phone" />
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
            <Link to={`/transactions/${txn.id}`} className="min-w-0 flex-1">
              <p className="font-medium text-[#132D42]">{txn.category?.name_ar || txn.description || 'معاملة'}</p>
              <p className="text-xs text-[#7E8991]">{formatDate(txn.transaction_date)} {txn.patient?.full_name ? `- ${txn.patient.full_name}` : ''}</p>
            </Link>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${txn.type === 'إيراد' ? 'text-[#2E8B73]' : 'text-[#C85C5C]'}`}>
                {txn.type === 'إيراد' ? '+' : '-'}{formatCurrency(txn.total_amount)}
              </span>
              <Link to={`/transactions/${txn.id}`}>
                <Button variant="ghost" size="sm" icon={Eye} />
              </Link>
              <Button variant="ghost" size="sm" icon={Printer} onClick={() => onPrint(txn.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
