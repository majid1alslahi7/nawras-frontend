import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Plus, Trash, Pill } from 'lucide-react';

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_id: '', visit_id: '', doctor_id: '',
    diagnosis: '', notes: '',
    items: [{ medication_id: '', medication_name: '', concentration: '', dosage: '', frequency: '', duration: '', route: 'فموي', timing: 'بعد الأكل', instructions: '' }],
  });

  const savePrescription = useMutate('post', '/prescriptions', {
    successMessage: 'تم كتابة الوصفة بنجاح',
    onSuccess: () => navigate('/prescriptions'),
  });

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { medication_id: '', medication_name: '', concentration: '', dosage: '', frequency: '', duration: '', route: 'فموي', timing: 'بعد الأكل', instructions: '' }] }));
  const removeItem = (index) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index][field] = value;
      return { ...prev, items };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      items: form.items.map(item => ({
        medication_name: item.medication_name || item.medication_id,
        concentration: item.concentration,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        route: item.route,
        timing: item.timing,
        instructions: item.instructions,
      })),
    };
    savePrescription.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/prescriptions')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">كتابة وصفة</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات المريض والتشخيص</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">المريض *</label><SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(val) => setForm({...form, patient_id: val})} placeholder="ابحث عن مريض..." displayField="full_name" valueField="id" secondaryField="phone" /></div>
              <div><label className="block text-sm font-medium mb-1">الطبيب *</label><SmartSelect endpoint="/doctors/dropdown" value={form.doctor_id} onChange={(val) => setForm({...form, doctor_id: val})} placeholder="اختر طبيب..." displayField="full_name" valueField="id" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">التشخيص *</label><Input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required placeholder="التشخيص المبني عليه الوصفة..." /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#153751]">الأدوية</CardTitle>
            <Button variant="outline" size="sm" icon={Plus} onClick={addItem}>إضافة دواء</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.items.map((item, index) => (
              <div key={index} className="p-4 bg-[#F2EFEE] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#153751]">دواء #{index + 1}</span>
                  {form.items.length > 1 && <Button variant="ghost" size="sm" icon={Trash} className="text-[#C85C5C]" onClick={() => removeItem(index)} />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">اسم الدواء *</label>
                    <SmartSelect endpoint="/medications/dropdown" value={item.medication_id} onChange={(val) => updateItem(index, 'medication_id', val)} placeholder="اختر من القائمة..." displayField="trade_name" valueField="trade_name" secondaryField="concentration" />
                  </div>
                  <div><label className="block text-xs font-medium mb-1">أو اكتب يدوي</label><Input value={item.medication_name} onChange={e => updateItem(index, 'medication_name', e.target.value)} placeholder="اسم الدواء..." /></div>
                  <div><label className="block text-xs font-medium mb-1">التركيز</label><Input value={item.concentration} onChange={e => updateItem(index, 'concentration', e.target.value)} placeholder="500mg" /></div>
                  <div><label className="block text-xs font-medium mb-1">الجرعة *</label><Input value={item.dosage} onChange={e => updateItem(index, 'dosage', e.target.value)} required placeholder="قرص واحد" /></div>
                  <div><label className="block text-xs font-medium mb-1">التكرار *</label><Input value={item.frequency} onChange={e => updateItem(index, 'frequency', e.target.value)} required placeholder="كل 8 ساعات" /></div>
                  <div><label className="block text-xs font-medium mb-1">المدة</label><Input value={item.duration} onChange={e => updateItem(index, 'duration', e.target.value)} placeholder="5 أيام" /></div>
                  <div>
                    <label className="block text-xs font-medium mb-1">طريقة الإعطاء</label>
                    <Select value={item.route} onChange={e => updateItem(index, 'route', e.target.value)}>
                      <option value="فموي">فموي</option><option value="موضعي">موضعي</option><option value="حقن">حقن</option><option value="وريدي">وريدي</option><option value="عضلي">عضلي</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">التوقيت</label>
                    <Select value={item.timing} onChange={e => updateItem(index, 'timing', e.target.value)}>
                      <option value="بعد الأكل">بعد الأكل</option><option value="قبل الأكل">قبل الأكل</option><option value="مع الأكل">مع الأكل</option><option value="عند النوم">عند النوم</option><option value="عند اللزوم">عند اللزوم</option>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">تعليمات إضافية</CardTitle></CardHeader>
          <CardContent><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="تعليمات للمريض..." /></CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/prescriptions')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={savePrescription.isLoading}>حفظ الوصفة</Button>
        </div>
      </form>
    </div>
  );
}
