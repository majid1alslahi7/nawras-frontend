import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Plus, Trash, FlaskConical } from 'lucide-react';

export default function LabRequestForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_id: '', visit_id: '', doctor_id: '',
    tests: [{ test_id: '', test_name: '', custom_name: '' }],
    clinical_diagnosis: '', urgency: 'عادي', notes: '',
  });

  const saveRequest = useMutate('post', '/lab-requests', {
    successMessage: 'تم طلب الفحوصات بنجاح',
    onSuccess: () => navigate('/lab'),
  });

  const addTest = () => setForm(prev => ({ ...prev, tests: [...prev.tests, { test_id: '', test_name: '', custom_name: '' }] }));
  const removeTest = (index) => setForm(prev => ({ ...prev, tests: prev.tests.filter((_, i) => i !== index) }));
  const updateTest = (index, field, value) => {
    setForm(prev => {
      const tests = [...prev.tests];
      tests[index][field] = value;
      if (field === 'test_id' && value) {
        // عند اختيار فحص من القائمة، نملأ الاسم تلقائياً
        tests[index].test_name = value;
      }
      return { ...prev, tests };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      patient_id: form.patient_id,
      visit_id: form.visit_id || null,
      doctor_id: form.doctor_id,
      tests_list_json: form.tests.map(t => ({ test_name: t.custom_name || t.test_name || t.test_id, test_id: t.test_id })),
    };
    saveRequest.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/lab')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">طلب فحوصات</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات الطلب</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">المريض *</label><SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(val) => setForm({...form, patient_id: val})} placeholder="ابحث عن مريض..." displayField="full_name" valueField="id" secondaryField="phone" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">درجة الاستعجال</label>
                <Select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                  <option value="عادي">عادي</option><option value="عاجل">عاجل</option><option value="طارئ">طارئ</option>
                </Select>
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-1">التشخيص السريري</label><Input value={form.clinical_diagnosis} onChange={e => setForm({...form, clinical_diagnosis: e.target.value})} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#153751]">الفحوصات المطلوبة</CardTitle>
            <Button variant="outline" size="sm" icon={Plus} onClick={addTest}>إضافة فحص</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.tests.map((test, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#F2EFEE] rounded-2xl">
                <FlaskConical className="w-5 h-5 text-[#1E5A78] shrink-0" />
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <SmartSelect
                    endpoint="/lab-tests/dropdown"
                    value={test.test_id}
                    onChange={(val) => updateTest(index, 'test_id', val)}
                    placeholder="اختر من القائمة..."
                    displayField="test_name"
                    valueField="test_name"
                  />
                  <Input
                    placeholder="أو اكتب اسم فحص يدوي..."
                    value={test.custom_name}
                    onChange={e => updateTest(index, 'custom_name', e.target.value)}
                  />
                </div>
                {form.tests.length > 1 && (
                  <Button variant="ghost" size="sm" icon={Trash} className="text-[#C85C5C]" onClick={() => removeTest(index)} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/lab')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={saveRequest.isLoading}>حفظ الطلب</Button>
        </div>
      </form>
    </div>
  );
}
