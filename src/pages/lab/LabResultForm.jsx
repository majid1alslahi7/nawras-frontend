import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Plus, Trash } from 'lucide-react';
import api from '../../services/api';

export default function LabResultForm() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lab_request_id: requestId || '', patient_id: '', visit_id: '',
    lab_name: '', lab_reference: '',
    results_json: [{ test_name: '', result: '', unit: '', normal_range: '', is_abnormal: false }],
    notes: '',
  });

  useEffect(() => {
    if (!requestId) return;

    api.get(`/lab-requests/${requestId}`)
      .then(({ data: d }) => {
        const data = d.data || d;
        setForm(prev => ({
          ...prev,
          lab_request_id: requestId,
          patient_id: data.patient_id,
          visit_id: data.visit_id || '',
          results_json: data.tests_list?.map(t => ({ test_name: t.test_name, result: '', unit: '', normal_range: '', is_abnormal: false })) || prev.results_json,
        }));
      }).catch(() => undefined);
  }, [requestId]);

  const handleRequestSelect = (reqId) => {
    setForm({ ...form, lab_request_id: reqId });
    if (reqId) {
      api.get(`/lab-requests/${reqId}`)
        .then(({ data: d }) => {
          const data = d.data || d;
          setForm(prev => ({
            ...prev, patient_id: data.patient_id, visit_id: data.visit_id || '',
            results_json: data.tests_list?.map(t => ({ test_name: t.test_name, result: '', unit: '', normal_range: '', is_abnormal: false })) || prev.results_json,
          }));
        }).catch(() => undefined);
    }
  };

  const createResult = useMutate('post', '/lab-results', {
    successMessage: 'تم إدخال النتائج بنجاح',
    onSuccess: () => navigate('/lab'),
  });

  const addRow = () => setForm({ ...form, results_json: [...form.results_json, { test_name: '', result: '', unit: '', normal_range: '', is_abnormal: false }] });
  const removeRow = (i) => setForm({ ...form, results_json: form.results_json.filter((_, idx) => idx !== i) });
  const updateRow = (i, field, value) => {
    const rows = [...form.results_json]; rows[i][field] = value; setForm({ ...form, results_json: rows });
  };
  const selectLabTest = (i, labTest) => {
    if (!labTest) {
      updateRow(i, 'test_name', '');
      return;
    }
    const rows = [...form.results_json];
    rows[i] = {
      ...rows[i],
      test_name: labTest.test_name,
      unit: labTest.unit || rows[i].unit,
      normal_range: labTest.normal_range || rows[i].normal_range,
    };
    setForm({ ...form, results_json: rows });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/lab')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">إدخال نتائج فحوصات</h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); createResult.mutate(form); }} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات الطلب</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">طلب الفحوصات *</label><SmartSelect endpoint="/lab-requests?status=مطلوب" value={form.lab_request_id} onChange={handleRequestSelect} placeholder="اختر طلب..." displayField="request_number" valueField="id" /></div>
            <div><label className="block text-sm font-medium mb-1">اسم المختبر</label><Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} placeholder="مختبر الدقة..." /></div>
            <div><label className="block text-sm font-medium mb-1">رقم التقرير</label><Input value={form.lab_reference} onChange={(e) => setForm({ ...form, lab_reference: e.target.value })} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">النتائج</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.results_json.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center bg-[#F2EFEE] p-3 rounded-2xl">
                <div className="col-span-4"><SmartSelect endpoint="/lab-tests/dropdown" value={row.test_name} onChange={(value) => updateRow(i, 'test_name', value)} onSelect={(labTest) => selectLabTest(i, labTest)} placeholder="الفحص" displayField="test_name" valueField="test_name" secondaryField="category" allowCustomValue /></div>
                <div className="col-span-2"><Input placeholder="النتيجة" value={row.result} onChange={(e) => updateRow(i, 'result', e.target.value)} required /></div>
                <div className="col-span-2"><Input placeholder="الوحدة" value={row.unit} onChange={(e) => updateRow(i, 'unit', e.target.value)} /></div>
                <div className="col-span-2"><Input placeholder="المجال الطبيعي" value={row.normal_range} onChange={(e) => updateRow(i, 'normal_range', e.target.value)} /></div>
                <div className="col-span-1 flex justify-center">
                  <input type="checkbox" checked={row.is_abnormal} onChange={(e) => updateRow(i, 'is_abnormal', e.target.checked)} className="w-5 h-5 rounded accent-[#C85C5C]" title="غير طبيعي" />
                </div>
                <div className="col-span-1">{form.results_json.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)} className="text-[#C85C5C]"><Trash className="w-4 h-4" /></Button>}</div>
              </div>
            ))}
            <Button type="button" variant="outline" icon={Plus} onClick={addRow}>إضافة نتيجة</Button>
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/lab')} icon={X}>إلغاء</Button>
          <Button type="submit" icon={Save} loading={createResult.isLoading}>حفظ النتائج</Button>
        </div>
      </form>
    </div>
  );
}
