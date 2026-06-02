import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SmartSelect from '../../components/ui/SmartSelect';
import { Plus, Search, Calendar, Phone, X, CreditCard, CheckCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const isNurse = user?.role === 'nurse';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(isNurse ? 'unpaid' : 'doctor');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient_id: '', appointment_date: '', appointment_time: '', visit_reason: '', visit_type: 'كشف جديد' });

  const endpoint = filter === 'unpaid' ? '/appointments/unpaid' : filter === 'doctor' ? '/appointments/doctor-view' : '/appointments';
  const { data, isLoading } = useGetQuery(['appointments', { search, filter }], `${endpoint}?search=${search}&per_page=50`);

  const createAppointment = useMutate('post', '/appointments', {
    invalidate: 'appointments',
    successMessage: 'تم حجز الموعد',
    onSuccess: () => setShowModal(false),
  });

  const payAppointment = useMutate('post', '/transactions', {
    invalidate: 'appointments',
    successMessage: 'تم تسجيل الدفع',
  });

  const handlePay = (appt) => {
    const amount = prompt('المبلغ:', '5000');
    if (amount) {
      payAppointment.mutate({
        category_id: 1,
        patient_id: appt.patient_id,
        amount: Number(amount),
        total_amount: Number(amount),
        type: 'إيراد',
        payment_method: 'نقدي',
        description: 'سند معاينة - ' + appt.patient?.full_name,
        receipt_type: 'appointment_receipt',
      });
      // تحديث الموعد
      fetch(`https://nawrasb.alssemam.com/api/appointments/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paid: true, status: 'مؤكد', free_until: new Date(Date.now() + 7*86400000).toISOString().split('T')[0] }),
      }).then(() => window.location.reload());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">المواعيد</h1><p className="text-[#7E8991] mt-1">{isNurse ? 'إدارة المواعيد والدفع' : 'جدول المواعيد'}</p></div>
        {isNurse && <Button icon={Plus} onClick={() => setShowModal(true)}>حجز موعد</Button>}
      </div>

      <div className="flex gap-2">
        {isNurse && <Button variant={filter === 'unpaid' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('unpaid')}>⏳ بانتظار الدفع</Button>}
        <Button variant={filter === 'doctor' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('doctor')}>📋 مواعيد اليوم</Button>
        <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>📅 الكل</Button>
      </div>

      {isLoading ? <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div> : (
        <div className="space-y-3">
          {data?.data?.map((appt) => (
            <Card key={appt.id} hover>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-[#153751]/5 rounded-2xl px-4 py-2 min-w-[70px]">
                    <p className="text-lg font-bold text-[#153751]">{formatTime(appt.appointment_time)}</p>
                    <p className="text-xs text-[#7E8991]">{formatDate(appt.appointment_date)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#132D42]">{appt.patient?.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#7E8991] mt-1">
                      <Phone className="w-3 h-3" /> {appt.patient?.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {appt.is_free && <Badge variant="success">مجاني</Badge>}
                  <Badge className={appt.status === 'pending_payment' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                    {appt.status === 'pending_payment' ? 'بانتظار الدفع' : appt.status}
                  </Badge>
                  {isNurse && !appt.is_paid && (
                    <Button variant="success" size="sm" icon={CreditCard} onClick={() => handlePay(appt)}>دفع</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="حجز موعد جديد" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createAppointment.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المريض *</label>
            <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(v) => setForm({ ...form, patient_id: v })} placeholder="ابحث عن مريض..." displayField="full_name" valueField="id" secondaryField="phone" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">التاريخ *</label><Input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">الوقت *</label><Input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">سبب الزيارة *</label><Input value={form.visit_reason} onChange={(e) => setForm({ ...form, visit_reason: e.target.value })} required /></div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)} icon={X}>إلغاء</Button>
            <Button type="submit" icon={Plus}>حجز</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
