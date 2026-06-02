import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SmartSelect from '../../components/ui/SmartSelect';
import { Plus, Search, Calendar, Phone, X } from 'lucide-react';
import { formatDate, statusStyles, formatTime } from '../../lib/utils';

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm] = useState({ patient_id: '', appointment_date: '', appointment_time: '', visit_reason: '', visit_type: 'كشف جديد', notes: '' });

  const { data, isLoading } = useGetQuery(['appointments', { search, filter }], `/appointments?search=${search}&filter=${filter}&per_page=50`);

  const createAppointment = useMutate('post', '/appointments', {
    invalidate: 'appointments',
    successMessage: 'تم حجز الموعد بنجاح',
    onSuccess: () => { setShowModal(false); setForm({ patient_id: '', appointment_date: '', appointment_time: '', visit_reason: '', visit_type: 'كشف جديد', notes: '' }); },
  });

  const statusMutation = useMutate('patch', '', { invalidate: 'appointments', successMessage: 'تم تحديث الحالة' });

  const handleStatusChange = (appointment, newStatus) => {
    statusMutation.mutate({ url: `/appointments/${appointment.id}/status`, status: newStatus });
  };

  const statusFlow = ['مؤكد', 'قيد الانتظار', 'حضر', 'جاري الكشف', 'مكتمل'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">المواعيد</h1><p className="text-[#7E8991] mt-1">إدارة مواعيد المرضى</p></div>
        <Button icon={Plus} onClick={() => { setSelectedAppt(null); setShowModal(true); }}>حجز موعد</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" /><Input placeholder="بحث عن مريض..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-12 bg-white" /></div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full sm:w-48">
          <option value="today">اليوم</option><option value="week">هذا الأسبوع</option><option value="upcoming">القادمة</option><option value="all">الكل</option>
        </Select>
      </div>

      {isLoading ? <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div> : (
        <div className="space-y-3">
          {data?.data?.map((appt) => (
            <Card key={appt.id} hover className="cursor-pointer" onClick={() => { setSelectedAppt(appt); setShowModal(true); }}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-[#153751]/5 rounded-2xl px-4 py-2 min-w-[70px]">
                    <p className="text-lg font-bold text-[#153751]">{formatTime(appt.appointment_time)}</p>
                    <p className="text-xs text-[#7E8991]">{formatDate(appt.appointment_date)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#132D42]">{appt.patient?.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#7E8991] mt-1"><Phone className="w-3 h-3" /> {appt.patient?.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyles[appt.status]}>{appt.status}</Badge>
                  <Badge variant="muted">{appt.visit_reason}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal - حجز موعد جديد */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedAppt ? 'تفاصيل الموعد' : 'حجز موعد جديد'} size="lg">
        {selectedAppt ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[#7E8991]">المريض</p><p className="font-semibold">{selectedAppt.patient?.full_name}</p></div>
              <div><p className="text-xs text-[#7E8991]">الهاتف</p><p className="font-semibold">{selectedAppt.patient?.phone}</p></div>
              <div><p className="text-xs text-[#7E8991]">التاريخ</p><p className="font-semibold">{formatDate(selectedAppt.appointment_date)}</p></div>
              <div><p className="text-xs text-[#7E8991]">الوقت</p><p className="font-semibold">{formatTime(selectedAppt.appointment_time)}</p></div>
            </div>
            <div>
              <p className="text-xs text-[#7E8991] mb-2">تغيير الحالة</p>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map((s) => (
                  <Button key={s} variant={selectedAppt.status === s ? 'primary' : 'outline'} size="sm" onClick={() => handleStatusChange(selectedAppt, s)}>{s}</Button>
                ))}
                <Button variant="danger" size="sm" onClick={() => handleStatusChange(selectedAppt, 'ملغى')}>ملغى</Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); createAppointment.mutate(form); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1">المريض *</label>
              <SmartSelect
                endpoint="/patients/dropdown"
                value={form.patient_id}
                onChange={(val) => setForm({ ...form, patient_id: val })}
                placeholder="ابحث عن مريض..."
                searchPlaceholder="اسم أو رقم هاتف..."
                displayField="full_name"
                valueField="id"
                secondaryField="phone"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">التاريخ *</label><Input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">الوقت *</label><Input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1">سبب الزيارة *</label>
              <Input value={form.visit_reason} onChange={(e) => setForm({ ...form, visit_reason: e.target.value })} required placeholder="مثال: كحة وحرارة" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1">نوع الزيارة</label>
              <Select value={form.visit_type} onChange={(e) => setForm({ ...form, visit_type: e.target.value })}>
                <option value="كشف جديد">كشف جديد</option><option value="متابعة">متابعة</option><option value="عرض نتائج">عرض نتائج</option><option value="استشارة">استشارة</option><option value="طارئ">طارئ</option>
              </Select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} icon={X}>إلغاء</Button>
              <Button type="submit" icon={Plus} loading={createAppointment.isLoading}>حجز</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
