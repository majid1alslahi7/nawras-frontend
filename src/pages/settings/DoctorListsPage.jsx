import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Edit, Trash, Search, Pill, FlaskConical } from 'lucide-react';

export default function DoctorListsPage() {
  const [tab, setTab] = useState('medications');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  const { data: medications } = useGetQuery(['medications', search], `/medications?search=${search}&per_page=50`);
  const { data: labTests } = useGetQuery(['lab-tests', search], `/lab-tests?search=${search}&per_page=50`);

  const endpoint = tab === 'medications' ? '/medications' : '/lab-tests';
  const saveMutation = useMutate(editing ? 'put' : 'post', editing ? `${endpoint}/${editing.id}` : endpoint, {
    invalidate: [tab, 'medications', 'lab-tests'],
    successMessage: editing ? 'تم التحديث' : 'تمت الإضافة',
    onSuccess: () => { setShowModal(false); setEditing(null); setForm({}); },
  });
  
  const deleteMutation = useMutate('delete', '', {
    invalidate: [tab, 'medications', 'lab-tests'],
    successMessage: 'تم الحذف',
  });

  const handleEdit = (item) => {
    setEditing(item);
    setForm(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد؟')) deleteMutation.mutate({ url: `${endpoint}/${id}` });
  };

  const list = tab === 'medications' ? medications?.data : labTests?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#132D42]">قوائم الطبيب</h2>
        <Button icon={Plus} onClick={() => { setEditing(null); setForm({}); setShowModal(true); }}>
          إضافة {tab === 'medications' ? 'دواء' : 'فحص'}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2">
        <Button variant={tab === 'medications' ? 'primary' : 'ghost'} onClick={() => setTab('medications')}><Pill className="w-4 h-4" /> الأدوية</Button>
        <Button variant={tab === 'lab-tests' ? 'primary' : 'ghost'} onClick={() => setTab('lab-tests')}><FlaskConical className="w-4 h-4" /> الفحوصات</Button>
      </div>

      <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" /><Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-12 bg-white" /></div>

      <div className="space-y-2">
        {list?.map((item) => (
          <Card key={item.id} hover>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#132D42]">
                  {tab === 'medications' ? item.trade_name : item.test_name}
                </p>
                <p className="text-xs text-[#7E8991]">
                  {tab === 'medications' ? `${item.concentration || ''} ${item.form || ''}` : item.category}
                </p>
                {tab === 'medications' && (item.default_dosage || item.default_frequency || item.default_duration) && (
                  <p className="text-xs text-[#7E8991] mt-1">
                    {[item.default_dosage, item.default_frequency, item.default_duration].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleEdit(item)} />
                <Button variant="ghost" size="sm" icon={Trash} onClick={() => handleDelete(item.id)} className="text-[#C85C5C]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل' : 'إضافة جديد'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
          {tab === 'medications' ? (
            <>
              <div><label className="block text-sm font-medium mb-1">الاسم التجاري *</label><Input value={form.trade_name || ''} onChange={e => setForm({...form, trade_name: e.target.value})} required /></div>
              <div><label className="block text-sm font-medium mb-1">الاسم العلمي</label><Input value={form.generic_name || ''} onChange={e => setForm({...form, generic_name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">التركيز</label><Input value={form.concentration || ''} onChange={e => setForm({...form, concentration: e.target.value})} placeholder="500mg" /></div>
                <div><label className="block text-sm font-medium mb-1">الشكل</label><Input value={form.form || ''} onChange={e => setForm({...form, form: e.target.value})} placeholder="اقراص" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">جرعة افتراضية</label><Input value={form.default_dosage || ''} onChange={e => setForm({...form, default_dosage: e.target.value})} placeholder="قرص واحد" /></div>
                <div><label className="block text-sm font-medium mb-1">تكرار افتراضي</label><Input value={form.default_frequency || ''} onChange={e => setForm({...form, default_frequency: e.target.value})} placeholder="كل 8 ساعات" /></div>
                <div><label className="block text-sm font-medium mb-1">مدة افتراضية</label><Input value={form.default_duration || ''} onChange={e => setForm({...form, default_duration: e.target.value})} placeholder="5 أيام" /></div>
              </div>
            </>
          ) : (
            <>
              <div><label className="block text-sm font-medium mb-1">اسم الفحص *</label><Input value={form.test_name || ''} onChange={e => setForm({...form, test_name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">الكود</label><Input value={form.test_code || ''} onChange={e => setForm({...form, test_code: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">التصنيف</label><Input value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} placeholder="دم، كيمياء..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">النطاق الطبيعي</label><Input value={form.normal_range || ''} onChange={e => setForm({...form, normal_range: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">الوحدة</label><Input value={form.unit || ''} onChange={e => setForm({...form, unit: e.target.value})} /></div>
              </div>
            </>
          )}
          <Button type="submit" loading={saveMutation.isLoading} className="w-full">حفظ</Button>
        </form>
      </Modal>
    </div>
  );
}
