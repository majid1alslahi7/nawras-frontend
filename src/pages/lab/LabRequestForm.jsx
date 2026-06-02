import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Plus, Trash } from 'lucide-react';

export default function LabRequestForm() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    visit_id: visitId || '',
    tests_list_json: [{ test_name: '', category: '' }],
    clinical_diagnosis: '',
    urgency: 'عادي',
    notes: '',
  });

  const createRequest = useMutate('post', '/lab-requests', {
    successMessage: 'تم إرسال طلب الفحوصات بنجاح',
    onSuccess: () => navigate('/lab'),
  });

  const addTest = () => setForm({ ...form, tests_list_json: [...form.tests_list_json, { test_name: '', category: '' }] });
  const removeTest = (i) => setForm({ ...form, tests_list_json: form.tests_list_json.filter((_, idx) => idx !== i) });
  const updateTest = (i, field, value) => {
    const tests = [...form.tests_list_json];
    tests[i][field] = value;
    setForm({ ...form, tests_list_json: tests });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/lab')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">طلب فحوصات جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createRequest.mutate(form); }} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات المريض والطبيب</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المريض *</label>
              <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(v) => setForm({ ...form, patient_id: v })} placeholder="اختر المريض..." displayField="full_name" valueField="id" secondaryField="phone" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الطبيب *</label>
              <SmartSelect endpoint="/users?role=doctor" value={form.doctor_id} onChange={(v) => setForm({ ...form, doctor_id: v })} placeholder="اختر الطبيب..." displayField="full_name" valueField="id" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">الفحوصات المطلوبة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.tests_list_json.map((test, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input placeholder="اسم الفحص (مثال: صورة دم كاملة)" value={test.test_name} onChange={(e) => updateTest(i, 'test_name', e.target.value)} required />
                </div>
                <div className="w-32">
                  <Input placeholder="تصنيف" value={test.category} onChange={(e) => updateTest(i, 'category', e.target.value)} />
                </div>
                {form.tests_list_json.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeTest(i)} className="text-[#C85C5C]"><Trash className="w-4 h-4" /></Button>
                )}
              </div>
            ))}
            <Button variant="outline" icon={Plus} onClick={addTest} type="button">إضافة فحص</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">تفاصيل إضافية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">التشخيص السريري</label>
              <Input value={form.clinical_diagnosis} onChange={(e) => setForm({ ...form, clinical_diagnosis: e.target.value })} placeholder="التشخيص المبدئي..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الأولوية</label>
                <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                  <option value="عادي">عادي</option><option value="عاجل">عاجل</option><option value="طارئ">طارئ</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات للمختبر..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/lab')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={createRequest.isLoading}>إرسال الطلب</Button>
        </div>
      </form>
    </div>
  );
}
