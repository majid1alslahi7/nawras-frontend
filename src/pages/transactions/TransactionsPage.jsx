import { useState } from 'react';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Plus, TrendingUp, TrendingDown, Banknote, CreditCard, ArrowRightLeft, Wallet, Printer, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function TransactionsPage() {
  const [filter, setFilter] = useState('today');
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const { data: daily } = useGetQuery('transactions-daily', '/transactions/summary/daily');
  const { data: incomeReceipts } = useGetQuery('receipts-income', '/receipts/income');
  const { data: expenseReceipts } = useGetQuery('receipts-expense', '/receipts/expense');
  const { data: transactions } = useGetQuery(['transactions', { filter }], `/transactions?filter=${filter}&per_page=50`);

  const paymentIcons = { 'نقدي': Banknote, 'بطاقة ائتمان': CreditCard, 'تحويل بنكي': ArrowRightLeft, 'محفظة إلكترونية': Wallet };

  const handlePrintReceipt = (id) => {
    window.open(`https://nawrasb.alssemam.com/api/transactions/${id}/receipt`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">المالية</h1><p className="text-[#7E8991] mt-1">المعاملات المالية وسندات القبض والصرف</p></div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>معاملة جديدة</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#2E8B73]/8 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#2E8B73]" /></div><div><p className="text-sm text-[#7E8991]">إيرادات اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.total_income || 0)}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#C85C5C]/8 rounded-2xl flex items-center justify-center"><TrendingDown className="w-6 h-6 text-[#C85C5C]" /></div><div><p className="text-sm text-[#7E8991]">مصروفات اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.total_expense || 0)}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 bg-[#153751]/8 rounded-2xl flex items-center justify-center"><Banknote className="w-6 h-6 text-[#153751]" /></div><div><p className="text-sm text-[#7E8991]">صافي الربح اليوم</p><p className="text-xl font-bold text-[#132D42]">{formatCurrency(daily?.net_profit || 0)}</p></div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'income', label: 'سندات القبض' },
          { key: 'expense', label: 'سندات الصرف' },
        ].map((t) => (
          <Button key={t.key} variant={tab === t.key ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t.key)}>{t.label}</Button>
        ))}
      </div>

      {/* Income Receipts */}
      {tab === 'income' && (
        <div className="space-y-2">
          {incomeReceipts?.data?.map((txn) => {
            const Icon = paymentIcons[txn.payment_method] || Banknote;
            return (
              <Card key={txn.id} hover>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2E8B73]/8 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-[#2E8B73]" /></div>
                    <div>
                      <p className="font-medium text-[#132D42]">{txn.patient?.full_name || txn.description}</p>
                      <p className="text-xs text-[#7E8991]">{formatDate(txn.transaction_date)} - {txn.category?.name_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2E8B73]">+{formatCurrency(txn.total_amount)}</span>
                    <Button variant="ghost" size="sm" icon={Printer} onClick={() => handlePrintReceipt(txn.id)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Expense Receipts */}
      {tab === 'expense' && (
        <div className="space-y-2">
          {expenseReceipts?.data?.map((txn) => {
            const Icon = paymentIcons[txn.payment_method] || Banknote;
            return (
              <Card key={txn.id} hover>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C85C5C]/8 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-[#C85C5C]" /></div>
                    <div>
                      <p className="font-medium text-[#132D42]">{txn.description || txn.category?.name_ar}</p>
                      <p className="text-xs text-[#7E8991]">{formatDate(txn.transaction_date)} - {txn.category?.name_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#C85C5C]">-{formatCurrency(txn.total_amount)}</span>
                    <Button variant="ghost" size="sm" icon={Printer} onClick={() => handlePrintReceipt(txn.id)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* All Transactions */}
      {tab === 'all' && (
        <div className="space-y-2">
          {transactions?.data?.map((txn) => {
            const Icon = paymentIcons[txn.payment_method] || Banknote;
            return (
              <Card key={txn.id} hover>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'إيراد' ? 'bg-[#2E8B73]/8' : 'bg-[#C85C5C]/8'}`}>
                      <Icon className={`w-5 h-5 ${txn.type === 'إيراد' ? 'text-[#2E8B73]' : 'text-[#C85C5C]'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#132D42]">{txn.category?.name_ar || txn.description}</p>
                      <p className="text-xs text-[#7E8991]">{formatDate(txn.transaction_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${txn.type === 'إيراد' ? 'text-[#2E8B73]' : 'text-[#C85C5C]'}`}>
                      {txn.type === 'إيراد' ? '+' : '-'}{formatCurrency(txn.total_amount)}
                    </span>
                    <Button variant="ghost" size="sm" icon={Printer} onClick={() => handlePrintReceipt(txn.id)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="معاملة مالية جديدة">
        <p className="text-center text-[#7E8991]">نموذج إضافة معاملة قادم</p>
      </Modal>
    </div>
  );
}
