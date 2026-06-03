import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SmartSelect from '../../components/ui/SmartSelect';
import { Plus, Search, Phone, X, CreditCard, Users, Eye } from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { actionToast as toast } from '../../lib/actionToast';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const isNurse = user?.role === 'nurse';
  const search = '';
  const [filter, setFilter] = useState(isNurse ? 'unpaid' : 'doctor');
  const [showModal, setShowModal] = useState(false);
  const [showPaidPatients, setShowPaidPatients] = useState(false);
  const [searchPaid, setSearchPaid] = useState('');
  const [form, setForm] = useState({ patient_id: '', appointment_date: '', appointment_time: '', visit_reason: '', visit_type: 'كشف جديد', is_free: false, free_until: '' });

  const endpoint = filter === 'unpaid' ? '/appointments/unpaid' : filter === 'doctor' ? '/appointments/doctor-view' : '/appointments';
  const { data, isLoading } = useGetQuery(['appointments', { search, filter }], `${endpoint}?search=${search}&per_page=50`);
  const { data: categories } = useGetQuery('categories', '/categories');

  // قائمة المرضى المدفوعين
  const { data: paidPatients } = useGetQuery(
    showPaidPatients ? ['paid-patients', searchPaid] : null,
    showPaidPatients ? `/appointments/paid-patients?search=${searchPaid}` : null
  );

  const createAppointment = useMutate('post', '/appointments', {
    invalidate: 'appointments',
    successMessage: 'تم حجز الموعد',
    onSuccess: () => { setShowModal(false); setShowPaidPatients(false); },
  });

  const payAppointment = useMutate('post', '/transactions', {
    invalidate: 'appointments',
    successMessage: 'تم تسجيل الدفع',
    onSuccess: () => window.location.reload(),
  });

  const handlePay = (appt) => {
    const amount = prompt('المبلغ (﷼):', '5000');
    const category = categories?.find((item) => item.type === 'إيراد' && item.name_ar === 'كشف طبي') || categories?.find((item) => item.type === 'إيراد');
    if (!category) {
      toast.error('لا يوجد تصنيف إيراد فعال لتسجيل السند');
      return;
    }
    if (amount) {
      payAppointment.mutate({
        category_id: category.id,
        appointment_id: appt.id,
        patient_id: appt.patient_id || appt.patient?.id,
        amount: Number(amount),
        type: 'إيراد',
        payment_method: 'نقدي',
        description: 'سند معاينة - ' + (appt.patient?.full_name || appt.full_name),
        receipt_type: 'appointment_receipt',
      });
    }
  };

  const selectPaidPatient = (patient) => {
    setForm({ ...form, patient_id: patient.id });
    setShowPaidPatients(false);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!form.patient_id) {
      toast.error('اختر المريض قبل حجز الموعد');
      return;
    }
    createAppointment.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">المواعيد</h1><p className="text-[#7E8991] mt-1">{isNurse ? 'إدارة المواعيد والدفع' : 'جدول المواعيد'}</p></div>
        {isNurse && <Button icon={Plus} onClick={() => setShowModal(true)}>حجز موعد</Button>}
      </div>

      <div className="flex gap-2 flex-wrap">
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
                    <h3 className="font-semibold text-[#132D42]">{appt.patient?.full_name || appt.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#7E8991] mt-1">
                      <Phone className="w-3 h-3" /> {appt.patient?.phone || appt.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {appt.is_free && <Badge variant="success">🆓 مجاني</Badge>}
                  {appt.has_valid_receipt && <Badge variant="info">✅ سند ساري</Badge>}
                  <Badge className={appt.status === 'pending_payment' || !appt.is_paid ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                    {!appt.is_paid ? '⏳ بانتظار الدفع' : appt.status}
                  </Badge>
                  {isNurse && !appt.is_paid && (
                    <Button variant="success" size="sm" icon={CreditCard} onClick={() => handlePay(appt)}>دفع</Button>
                  )}
                  <Link to={`/appointments/${appt.id}`}><Button variant="ghost" size="sm" icon={Eye} /></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal حجز موعد */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setShowPaidPatients(false); }} title="حجز موعد جديد" size="lg">
        <div className="space-y-4">
          {/* زر إضافة مريض من المواعيد المدفوعة */}
          <Button variant="outline" icon={Users} onClick={() => setShowPaidPatients(!showPaidPatients)} className="w-full">
            {showPaidPatients ? 'إخفاء القائمة' : 'اختيار مريض من المواعيد المدفوعة'}
          </Button>

          {showPaidPatients && (
            <div className="border border-[#E9E5E3] rounded-2xl p-3 space-y-2 max-h-48 overflow-y-auto">
              <Input
                value={searchPaid}
                onChange={(e) => setSearchPaid(e.target.value)}
                placeholder="بحث عن مريض..."
                icon={Search}
              />
              {paidPatients?.data?.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPaidPatient(p)}
                  className={`w-full text-right p-3 rounded-xl hover:bg-[#F2EFEE] ${form.patient_id === p.id ? 'bg-[#153751]/10 border border-[#153751]' : ''}`}
                >
                  <p className="font-medium text-sm">{p.full_name}</p>
                  <p className="text-xs text-[#7E8991]">
                    📞 {p.phone} | 📅 {p.appointment_date} | 🏷️ {p.visit_reason}
                  </p>
                  {p.has_valid_receipt && <Badge variant="success" className="mt-1">✅ سند ساري حتى {p.free_until}</Badge>}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">المريض *</label>
              <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(value) => setForm({ ...form, patient_id: value })} placeholder="ابحث عن المريض..." displayField="full_name" valueField="id" secondaryField="phone" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">التاريخ *</label><Input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الوقت *</label><Input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">سبب الزيارة *</label><Input value={form.visit_reason} onChange={(e) => setForm({ ...form, visit_reason: e.target.value })} required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الزيارة</label>
                <Select value={form.visit_type} onChange={(e) => setForm({ ...form, visit_type: e.target.value })}>
                  <option value="كشف جديد">كشف جديد</option>
                  <option value="متابعة">متابعة</option>
                  <option value="عرض نتائج">عرض نتائج</option>
                  <option value="استشارة">استشارة</option>
                  <option value="طارئ">طارئ</option>
                  <option value="إجراء">إجراء</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">مجاني حتى</label>
                <Input type="date" value={form.free_until} onChange={(e) => setForm({ ...form, free_until: e.target.value, is_free: Boolean(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} icon={X}>إلغاء</Button>
              <Button type="submit" icon={Plus}>حجز</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
