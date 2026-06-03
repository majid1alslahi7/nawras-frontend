import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import SmartSelect from '../../components/ui/SmartSelect';
import { Save, X, ArrowRight, Plus, Trash, Printer } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { openApiFile } from '../../lib/downloads';
import { toast } from 'sonner';

const TEST_TEMPLATES = {
  'دم': ['صورة دم كاملة (CBC)', 'سرعة ترسيب (ESR)', 'سكر صائم (FBS)', 'سكر تراكمي (HbA1c)', 'دهون ثلاثية', 'كوليسترول', 'فيتامين د', 'فيتامين B12'],
  'كيمياء': ['وظائف كبد (LFT)', 'وظائف كلى (RFT)', 'حمض البوليك', 'حديد', 'كالسيوم'],
  'هرمونات': ['TSH', 'T3', 'T4', 'هرمون النمو'],
  'أشعة': ['أشعة صدر (Chest X-Ray)', 'أشعة بطن', 'أشعة عظام', 'سونار بطن'],
  'أخرى': ['فحص بول', 'فحص براز', 'تخطيط قلب (ECG)'],
};

export default function LabRequestForm() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    patient_id: '', doctor_id: user?.id || '', visit_id: visitId || '',
    tests_list_json: [{ test_name: '', category: '' }],
    clinical_diagnosis: '', urgency: 'عادي', notes: '',
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const printAfterSaveRef = useRef(false);

  const createRequest = useMutate('post', '/lab-requests', {
    successMessage: 'تم إرسال طلب الفحوصات بنجاح',
    onSuccess: (data) => {
      if (printAfterSaveRef.current || confirm('هل تريد طباعة طلب الفحوصات؟')) {
        openApiFile(`/lab-requests/${data.data?.id || data.id}/pdf`, `lab-request-${data.data?.id || data.id}.pdf`)
          .catch(() => toast.error('تعذرت طباعة طلب الفحوصات'));
      }
      printAfterSaveRef.current = false;
      navigate('/lab');
    },
    onError: () => {
      printAfterSaveRef.current = false;
    },
  });

  const addTest = (testName = '', category = '') => {
    setForm({ ...form, tests_list_json: [...form.tests_list_json, { test_name: testName, category }] });
  };
  const removeTest = (i) => setForm({ ...form, tests_list_json: form.tests_list_json.filter((_, idx) => idx !== i) });
  const updateTest = (i, field, value) => {
    const tests = [...form.tests_list_json];
    tests[i][field] = value;
    setForm({ ...form, tests_list_json: tests });
  };
  const selectTest = (i, labTest) => {
    if (!labTest) {
      updateTest(i, 'test_name', '');
      return;
    }
    const tests = [...form.tests_list_json];
    tests[i] = { test_name: labTest.test_name, category: labTest.category || '' };
    setForm({ ...form, tests_list_json: tests });
  };

  const handleSubmit = (e, shouldPrint = false) => {
    e.preventDefault();
    printAfterSaveRef.current = shouldPrint;
    if (!form.patient_id) {
      printAfterSaveRef.current = false;
      toast.error('اختر المريض قبل إرسال طلب الفحوصات');
      return;
    }
    if (!form.doctor_id) {
      printAfterSaveRef.current = false;
      toast.error('اختر الطبيب قبل إرسال طلب الفحوصات');
      return;
    }
    const filteredTests = form.tests_list_json.filter(t => (t.test_name || '').trim());
    if (filteredTests.length === 0) {
      printAfterSaveRef.current = false;
      toast.error('أضف فحصاً واحداً على الأقل');
      return;
    }
    createRequest.mutate({ ...form, tests_list_json: filteredTests });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/lab')}>العودة</Button>
        <h1 className="text-2xl font-bold text-[#132D42]">طلب فحوصات جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">معلومات المريض والطبيب</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المريض *</label>
              <SmartSelect endpoint="/patients/dropdown" value={form.patient_id} onChange={(v) => setForm({ ...form, patient_id: v })} placeholder="اختر المريض..." displayField="full_name" valueField="id" secondaryField="phone" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الطبيب *</label>
              <SmartSelect endpoint="/doctors/dropdown" value={form.doctor_id} onChange={(v) => setForm({ ...form, doctor_id: v })} placeholder="اختر الطبيب..." displayField="full_name" valueField="id" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#153751]">الفحوصات المطلوبة</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                {showTemplates ? 'إخفاء القوالب' : '📋 قوالب جاهزة'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* قوالب جاهزة */}
            {showTemplates && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {Object.entries(TEST_TEMPLATES).map(([category, tests]) => (
                  <div key={category} className="border border-[#E9E5E3] rounded-xl p-2">
                    <p className="text-xs font-bold text-[#153751] mb-1">{category}</p>
                    {tests.map((test) => (
                      <button key={test} type="button" onClick={() => addTest(test, category)}
                        className="block w-full text-right text-xs px-2 py-1 rounded-lg hover:bg-[#153751]/5 text-[#7E8991] hover:text-[#153751]">
                        + {test}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* قائمة الفحوصات المضافة */}
            {form.tests_list_json.map((test, i) => (
              <div key={i} className="flex gap-3 items-start bg-[#F2EFEE] p-3 rounded-2xl">
                <span className="text-xs text-[#7E8991] pt-3 w-6">{i + 1}.</span>
                <div className="flex-1">
                  <SmartSelect endpoint="/lab-tests/dropdown" value={test.test_name} onChange={(value) => updateTest(i, 'test_name', value)} onSelect={(labTest) => selectTest(i, labTest)} placeholder="اختر أو ابحث عن الفحص..." displayField="test_name" valueField="test_name" secondaryField="category" allowCustomValue />
                </div>
                <div className="w-28">
                  <Select value={test.category} onChange={(e) => updateTest(i, 'category', e.target.value)}>
                    <option value="">تصنيف</option>
                    {Object.keys(TEST_TEMPLATES).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </Select>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTest(i)} className="text-[#C85C5C] shrink-0"><Trash className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" icon={Plus} onClick={() => addTest()}>إضافة فحص يدوي</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#153751]">تفاصيل إضافية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">التشخيص السريري</label><Input value={form.clinical_diagnosis} onChange={(e) => setForm({ ...form, clinical_diagnosis: e.target.value })} placeholder="التشخيص المبدئي..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">الأولوية</label><Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option value="عادي">عادي</option><option value="عاجل">عاجل</option><option value="طارئ">طارئ</option></Select></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">ملاحظات للمختبر</label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات إضافية..." /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/lab')} icon={X}>إلغاء</Button>
          <Button type="button" variant="outline" icon={Printer} onClick={(e) => handleSubmit(e, true)}>حفظ وطباعة</Button>
          <Button type="submit" icon={Save} loading={createRequest.isLoading}>إرسال الطلب</Button>
        </div>
      </form>
    </div>
  );
}
