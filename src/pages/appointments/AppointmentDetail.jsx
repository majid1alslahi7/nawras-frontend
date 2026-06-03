import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarClock, CreditCard, Printer, User } from 'lucide-react';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatTime, statusStyles } from '../../lib/utils';
import { openApiFile } from '../../lib/downloads';
import { toast } from 'sonner';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetQuery(['appointment', id], `/appointments/${id}`);
  const appointment = data?.data || data;

  if (isLoading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!appointment) return <div className="text-center py-12 text-[#7E8991]">الموعد غير موجود</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/appointments')}>العودة</Button>
          <div>
            <h1 className="text-2xl font-bold text-[#132D42]">تفاصيل الموعد</h1>
            <p className="text-sm text-[#7E8991]">{formatDate(appointment.appointment_date)} - {formatTime(appointment.appointment_time)}</p>
          </div>
        </div>
        {appointment.paid_transaction_id && (
          <Button icon={Printer} onClick={() => openApiFile(`/transactions/${appointment.paid_transaction_id}/receipt`, `receipt-${appointment.paid_transaction_id}.pdf`).catch(() => toast.error('تعذرت طباعة السند'))}>طباعة السند</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> المريض</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="الاسم" value={appointment.patient ? <Link to={`/patients/${appointment.patient.id}`} className="text-[#153751] hover:underline">{appointment.patient.full_name}</Link> : '-'} />
            <Row label="الهاتف" value={appointment.patient?.phone || '-'} />
            <Row label="رقم الملف" value={appointment.patient?.file_number || '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5" /> الموعد</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="التاريخ" value={formatDate(appointment.appointment_date)} />
            <Row label="الوقت" value={formatTime(appointment.appointment_time)} />
            <Row label="نوع الزيارة" value={appointment.visit_type} />
            <Row label="الأولوية" value={appointment.priority} />
            <div className="flex justify-between items-center"><span className="text-[#7E8991] text-sm">الحالة</span><Badge className={statusStyles[appointment.status]}>{appointment.status}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> الدفع</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Info label="حالة الدفع" value={appointment.payment_status || 'unpaid'} />
          <Info label="مجاني" value={appointment.is_free ? 'نعم' : 'لا'} />
          <Info label="سند مدفوع" value={appointment.paid_transaction_id ? `#${appointment.paid_transaction_id}` : '-'} />
          {appointment.paid_transaction_id && <Link to={`/transactions/${appointment.paid_transaction_id}`} className="md:col-span-3 text-[#153751] hover:underline">فتح تفاصيل السند</Link>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>سبب الزيارة والملاحظات</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-[#F2EFEE] rounded-2xl p-4">{appointment.visit_reason || '-'}</div>
          {appointment.notes && <div className="bg-white border border-[#E9E5E3] rounded-2xl p-4">{appointment.notes}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-4"><span className="text-[#7E8991] text-sm">{label}</span><span className="font-semibold text-[#132D42]">{value}</span></div>;
}

function Info({ label, value }) {
  return <div className="border border-[#E9E5E3] rounded-2xl p-3"><p className="text-xs text-[#7E8991]">{label}</p><p className="font-semibold text-[#132D42] mt-1">{value}</p></div>;
}
