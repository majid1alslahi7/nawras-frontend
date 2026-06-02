import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight } from 'lucide-react';

export default function PatientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: patient } = useGetQuery(isEdit ? ['patient', id] : null, isEdit ? `/patients/${id}` : null);

  const [form, setForm] = useState({
    full_name: '', phone: '', phone2: '', address: '', birth_date: '',
    gender: '', blood_type: '', national_id: '', email: '', occupation: '',
    marital_status: '', emergency_contact_name: '', emergency_contact_phone: '', notes: '',
    medical_history: { chronic_diseases: '', allergies: '', previous_surgeries: '', current_medications: '', smoking_status: 'غير مدخن' },
  });

  useEffect(() => {
    if (patient?.data) {
      const p = patient.data;
      setForm({
        full_name: p.full_name || '', phone: p.phone || '', phone2: p.phone2 || '',
        address: p.address || '', birth_date: p.birth_date || '', gender: p.gender || '',
        blood_type: p.blood_type || '', national_id: p.national_id || '', email: p.email || '',
        occupation: p.occupation || '', marital_status: p.marital_status || '',
        emergency_contact_name: p.emergency_contact?.name || '', emergency_contact_phone: p.emergency_contact?.phone || '',
        notes: p.notes || '',
        medical_history: {
          chronic_diseases: p.medical_history?.chronic_diseases || '',
          allergies: p.medical_history?.allergies || '',
          previous_surgeries: p.medical_history?.previous_surgeries || '',
          current_medications: p.medical_history?.current_medications || '',
          smoking_status: p.medical_history?.smoking_status || 'غير مدخن',
        },
      });
    }
  }, [patient]);

  const savePatient = useMutate(isEdit ? 'put' : 'post', isEdit ? `/patients/${id}` : '/patients', {
    successMessage: isEdit ? 'تم تحديث المريض' : 'تم إضافة المريض بنجاح',
    onSuccess: () => navigate('/patients'),
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateMedical = (field, value) => setForm(prev => ({ ...prev, medical_history: { ...prev.medical_history, [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    savePatient.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/patients')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">{isEdit ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">المعلومات الأساسية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">الاسم الرباعي *</label><Input value={form.full_name} onChange={e => updateField('full_name', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium mb-1">رقم الهاتف *</label><Input value={form.phone} onChange={e => updateField('phone', e.target.value)} required dir="ltr" /></div>
              <div><label className="block text-sm font-medium mb-1">رقم بديل</label><Input value={form.phone2} onChange={e => updateField('phone2', e.target.value)} dir="ltr" /></div>
              <div><label className="block text-sm font-medium mb-1">تاريخ الميلاد</label><Input type="date" value={form.birth_date} onChange={e => updateField('birth_date', e.target.value)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">الجنس</label>
                <Select value={form.gender} onChange={e => updateField('gender', e.target.value)}><option value="">اختر...</option><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">فصيلة الدم</label>
                <Select value={form.blood_type} onChange={e => updateField('blood_type', e.target.value)}>
                  <option value="">اختر...</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>
              <div><label className="block text-sm font-medium mb-1">رقم الهوية</label><Input value={form.national_id} onChange={e => updateField('national_id', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">البريد الإلكتروني</label><Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">المهنة</label><Input value={form.occupation} onChange={e => updateField('occupation', e.target.value)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة الاجتماعية</label>
                <Select value={form.marital_status} onChange={e => updateField('marital_status', e.target.value)}>
                  <option value="">اختر...</option><option value="أعزب">أعزب</option><option value="متزوج">متزوج</option><option value="مطلق">مطلق</option><option value="أرمل">أرمل</option>
                </Select>
              </div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">العنوان</label><Input value={form.address} onChange={e => updateField('address', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">جهة اتصال الطوارئ</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم</label><Input value={form.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">رقم الهاتف</label><Input value={form.emergency_contact_phone} onChange={e => updateField('emergency_contact_phone', e.target.value)} dir="ltr" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">التاريخ الطبي</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">الأمراض المزمنة</label><Input value={form.medical_history.chronic_diseases} onChange={e => updateMedical('chronic_diseases', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">الحساسية</label><Input value={form.medical_history.allergies} onChange={e => updateMedical('allergies', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">العمليات السابقة</label><Input value={form.medical_history.previous_surgeries} onChange={e => updateMedical('previous_surgeries', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">الأدوية الحالية</label><Input value={form.medical_history.current_medications} onChange={e => updateMedical('current_medications', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">حالة التدخين</label>
              <Select value={form.medical_history.smoking_status} onChange={e => updateMedical('smoking_status', e.target.value)}>
                <option value="غير مدخن">غير مدخن</option><option value="مدخن">مدخن</option><option value="مدخن سابق">مدخن سابق</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">ملاحظات</CardTitle></CardHeader>
          <CardContent><Input value={form.notes} onChange={e => updateField('notes', e.target.value)} placeholder="ملاحظات عامة..." /></CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/patients')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={savePatient.isLoading}>{isEdit ? 'تحديث' : 'حفظ'}</Button>
        </div>
      </form>
    </div>
  );
}
