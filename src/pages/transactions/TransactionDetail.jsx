import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Printer, ReceiptText, User, CalendarClock } from 'lucide-react';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { openApiFile } from '../../lib/downloads';
import { actionToast as toast } from '../../lib/actionToast';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetQuery(['transaction', id], `/transactions/${id}`);
  const transaction = data?.data || data;

  if (isLoading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!transaction) return <div className="text-center py-12 text-[#7E8991]">المعاملة غير موجودة</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/transactions')}>العودة</Button>
          <div>
            <h1 className="text-2xl font-bold text-[#132D42]">تفاصيل السند</h1>
            <p className="text-sm text-[#7E8991]">{transaction.receipt_number}</p>
          </div>
        </div>
        <Button icon={Printer} onClick={() => openApiFile(`/transactions/${transaction.id}/receipt`, `receipt-${transaction.id}.pdf`).catch(() => toast.error('تعذرت طباعة السند'))}>طباعة السند</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[#7E8991]">نوع المعاملة</p>
            <Badge className={transaction.type === 'إيراد' ? 'bg-[#2E8B73]/10 text-[#2E8B73] mt-2' : 'bg-[#C85C5C]/10 text-[#C85C5C] mt-2'}>{transaction.type}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[#7E8991]">الإجمالي</p>
            <p className={`text-2xl font-bold mt-1 ${transaction.type === 'إيراد' ? 'text-[#2E8B73]' : 'text-[#C85C5C]'}`}>{formatCurrency(transaction.total_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[#7E8991]">طريقة الدفع</p>
            <p className="font-semibold text-[#132D42] mt-1">{transaction.payment_method}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="w-5 h-5" /> بيانات السند</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="التصنيف" value={transaction.category?.name_ar || transaction.category?.name || '-'} />
          <Row label="تاريخ المعاملة" value={formatDateTime(transaction.transaction_date)} />
          <Row label="المبلغ" value={formatCurrency(transaction.amount)} />
          <Row label="الخصم" value={formatCurrency(transaction.discount || 0)} />
          <Row label="الضريبة" value={formatCurrency(transaction.tax || 0)} />
          <Row label="نوع السند" value={transaction.receipt_type || '-'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> الربط</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="المريض" value={transaction.patient ? <Link className="text-[#153751] hover:underline" to={`/patients/${transaction.patient.id}`}>{transaction.patient.full_name}</Link> : 'غير مرتبط'} />
          <Row label="رقم الموعد" value={transaction.appointment_id || '-'} />
          <Row label="رقم الكشف" value={transaction.visit_id || '-'} />
          <Row label="مدخل السند" value={transaction.entered_by?.full_name || '-'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5" /> البيان والملاحظات</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-[#F2EFEE] rounded-2xl p-4 text-sm text-[#132D42]">{transaction.description || 'لا يوجد بيان'}</div>
          {transaction.notes && <div className="bg-white border border-[#E9E5E3] rounded-2xl p-4 text-sm text-[#132D42]">{transaction.notes}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="border border-[#E9E5E3] rounded-2xl p-3">
      <p className="text-xs text-[#7E8991] mb-1">{label}</p>
      <div className="font-semibold text-[#132D42]">{value}</div>
    </div>
  );
}
