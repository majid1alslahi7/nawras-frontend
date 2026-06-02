import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Heart, Thermometer, Activity } from 'lucide-react';

export default function VisitForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: visit } = useGetQuery(isEdit ? ['visit', id] : null, isEdit ? `/visits/${id}` : null);

  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', visit_date: new Date().toISOString().slice(0, 16),
    chief_complaint: '', present_illness: '', diagnosis_initial: '',
    diagnosis_final: '', icd10_code: '', doctor_notes: '', plan: '',
    status: 'قيد الكشف', is_free: false,
    vitals: { blood_pressure_sys: '', blood_pressure_dia: '', heart_rate: '', temperature: '', oxygen_saturation: '', weight_kg: '', height_cm: '', pain_level: '' },
  });

  useEffect(() => {
    if (visit?.data) {
      const v = visit.data;
      setForm({
        patient_id: v.patient?.id || '', doctor_id: v.doctor?.id || '', visit_date: v.visit_date?.slice(0, 16) || '',
        chief_complaint: v.chief_complaint || '', present_illness: v.present_illness || '',
        diagnosis_initial: v.diagnosis_initial || '', diagnosis_final: v.diagnosis_final || '',
        icd10_code: v.icd10_code || '', doctor_notes: v.doctor_notes || '', plan: v.plan || '',
        status: v.status || 'قيد الكشف', is_free: v.is_free || false,
        vitals: { ...form.vitals, ...(v.vitals || {}) },
      });
    }
  }, [visit]);

  const saveVisit = useMutate(isEdit ? 'put' : 'post', isEdit ? `/visits/${id}` : '/visits', {
    successMessage: isEdit ? 'تم تحديث الكشف' : 'تم بدء الكشف بنجاح',
    onSuccess: () => navigate('/visits'),
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateVital = (field, value) => setForm(prev => ({ ...prev, vitals: { ...prev.vitals, [field]: value } }));

  const handleSubmit = (e) => { e.preventDefault(); saveVisit.mutate(form); };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/visits')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">{isEdit ? 'تعديل الكشف' : 'كشف جديد'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات الكشف</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">المريض *</label>
                <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(val) => updateField('patient_id', val)} placeholder="ابحث عن مريض..." displayField="full_name" valueField="id" secondaryField="phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الطبيب *</label>
                <SmartSelect endpoint="/doctors/dropdown" value={form.doctor_id} onChange={(val) => updateField('doctor_id', val)} placeholder="اختر طبيب..." displayField="full_name" valueField="id" />
              </div>
              <div><label className="block text-sm font-medium mb-1">التاريخ</label><Input type="datetime-local" value={form.visit_date} onChange={e => updateField('visit_date', e.target.value)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <Select value={form.status} onChange={e => updateField('status', e.target.value)}>
                  <option value="قيد الكشف">قيد الكشف</option><option value="فحوصات مطلوبة">فحوصات مطلوبة</option><option value="في انتظار النتائج">في انتظار النتائج</option><option value="مكتمل">مكتمل</option>
                </Select>
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-1">الشكوى الرئيسية *</label><Input value={form.chief_complaint} onChange={e => updateField('chief_complaint', e.target.value)} required placeholder="سبب الزيارة..." /></div>
            <div><label className="block text-sm font-medium mb-1">تاريخ المرض الحالي</label><Input value={form.present_illness} onChange={e => updateField('present_illness', e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">التشخيص المبدئي</label><Input value={form.diagnosis_initial} onChange={e => updateField('diagnosis_initial', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">التشخيص النهائي</label><Input value={form.diagnosis_final} onChange={e => updateField('diagnosis_final', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">العلامات الحيوية</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium mb-1">الضغط (انقباضي)</label><Input type="number" value={form.vitals.blood_pressure_sys} onChange={e => updateVital('blood_pressure_sys', e.target.value)} placeholder="120" /></div>
            <div><label className="block text-sm font-medium mb-1">الضغط (انبساطي)</label><Input type="number" value={form.vitals.blood_pressure_dia} onChange={e => updateVital('blood_pressure_dia', e.target.value)} placeholder="80" /></div>
            <div><label className="block text-sm font-medium mb-1">النبض</label><Input type="number" value={form.vitals.heart_rate} onChange={e => updateVital('heart_rate', e.target.value)} placeholder="72" /></div>
            <div><label className="block text-sm font-medium mb-1">الحرارة °C</label><Input type="number" step="0.1" value={form.vitals.temperature} onChange={e => updateVital('temperature', e.target.value)} placeholder="37.0" /></div>
            <div><label className="block text-sm font-medium mb-1">نسبة الأكسجين %</label><Input type="number" value={form.vitals.oxygen_saturation} onChange={e => updateVital('oxygen_saturation', e.target.value)} placeholder="98" /></div>
            <div><label className="block text-sm font-medium mb-1">الوزن (كغم)</label><Input type="number" step="0.1" value={form.vitals.weight_kg} onChange={e => updateVital('weight_kg', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">الطول (سم)</label><Input type="number" step="0.1" value={form.vitals.height_cm} onChange={e => updateVital('height_cm', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">مستوى الألم (0-10)</label><Input type="number" min="0" max="10" value={form.vitals.pain_level} onChange={e => updateVital('pain_level', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">ملاحظات وخطة علاجية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">ملاحظات الطبيب</label><Input value={form.doctor_notes} onChange={e => updateField('doctor_notes', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">الخطة العلاجية</label><Input value={form.plan} onChange={e => updateField('plan', e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/visits')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={saveVisit.isLoading}>{isEdit ? 'تحديث' : 'بدء الكشف'}</Button>
        </div>
      </form>
    </div>
  );
}
