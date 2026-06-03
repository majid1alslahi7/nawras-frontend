import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Settings, Users, UserPlus, Shield, Save, Edit, Trash, Pill } from 'lucide-react';
import DoctorListsPage from './DoctorListsPage';

export default function SettingsPage() {
  const [tab, setTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'nurse' });

  const { data: users } = useGetQuery('users-list', '/users');
  const { data: settings } = useGetQuery('settings', '/settings');

  const saveUser = useMutate(editingUser ? 'put' : 'post', editingUser ? `/users/${editingUser.id}` : '/users', {
    invalidate: 'users-list',
    successMessage: editingUser ? 'تم تعديل المستخدم' : 'تم إضافة المستخدم',
    onSuccess: () => { setShowUserModal(false); resetForm(); },
  });

  const deleteUser = useMutate('delete', '', { invalidate: 'users-list', successMessage: 'تم حذف المستخدم' });
  const saveSettings = useMutate('put', '/settings', {
    invalidate: 'settings',
    successMessage: 'تم حفظ إعدادات العيادة',
  });

  const resetForm = () => { setForm({ full_name: '', phone: '', email: '', password: '', role: 'nurse' }); setEditingUser(null); };
  const handleEdit = (user) => { setEditingUser(user); setForm({ full_name: user.full_name, phone: user.phone, email: user.email || '', password: '', role: user.role }); setShowUserModal(true); };
  const handleDelete = (id) => { if (confirm('هل أنت متأكد؟')) deleteUser.mutate({ url: `/users/${id}` }); };

  const roleLabels = { doctor: 'طبيب', nurse: 'ممرض', admin: 'مدير' };
  const roleColors = { doctor: 'info', nurse: 'success', admin: 'warning' };
  const settingValue = (key) => settings?.find((item) => item.setting_key === key)?.setting_value || '';
  const handleSettingsSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keys = ['clinic_name', 'clinic_phone', 'clinic_address', 'consultation_fee', 'followup_fee', 'working_hours_start', 'working_hours_end'];
    saveSettings.mutate({
      settings: keys.map((key) => ({
        setting_key: key,
        setting_value: formData.get(key),
        setting_type: ['consultation_fee', 'followup_fee'].includes(key) ? 'number' : 'text',
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-[#132D42]">الإعدادات</h1><p className="text-[#7E8991] mt-1">إدارة المستخدمين، القوائم، وإعدادات العيادة</p></div>

      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2 flex-wrap">
        <Button variant={tab === 'users' ? 'primary' : 'ghost'} onClick={() => setTab('users')}><Users className="w-4 h-4" /> المستخدمين</Button>
        <Button variant={tab === 'lists' ? 'primary' : 'ghost'} onClick={() => setTab('lists')}><Pill className="w-4 h-4" /> قوائم الطبيب</Button>
        <Button variant={tab === 'clinic' ? 'primary' : 'ghost'} onClick={() => setTab('clinic')}><Settings className="w-4 h-4" /> العيادة</Button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h2 className="text-lg font-semibold">المستخدمين</h2><Button icon={UserPlus} onClick={() => { resetForm(); setShowUserModal(true); }}>إضافة مستخدم</Button></div>
          <div className="space-y-2">
            {users?.data?.map((user) => (
              <Card key={user.id} hover><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-[#153751]" /><div><p className="font-medium">{user.full_name}</p><p className="text-xs text-[#7E8991]">{user.phone}</p></div></div>
                <div className="flex items-center gap-3"><Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge><Button variant="ghost" size="sm" icon={Edit} onClick={() => handleEdit(user)} /><Button variant="ghost" size="sm" icon={Trash} className="text-[#C85C5C]" onClick={() => handleDelete(user.id)} /></div>
              </CardContent></Card>
            ))}
          </div>
          <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'تعديل' : 'إضافة'} size="lg">
            <form onSubmit={(e) => { e.preventDefault(); saveUser.mutate(form); }} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">الاسم</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">الهاتف</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div><div><label className="block text-sm font-medium mb-1">البريد</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">الدور</label><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="doctor">طبيب</option><option value="nurse">ممرض</option><option value="admin">مدير</option></Select></div><div><label className="block text-sm font-medium mb-1">كلمة المرور</label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} /></div></div>
              <div className="flex gap-3 justify-end"><Button variant="outline" onClick={() => setShowUserModal(false)}>إلغاء</Button><Button type="submit" loading={saveUser.isLoading}>حفظ</Button></div>
            </form>
          </Modal>
        </div>
      )}

      {tab === 'lists' && <DoctorListsPage />}

      {tab === 'clinic' && (
        <Card>
          <CardHeader><CardTitle>معلومات العيادة</CardTitle></CardHeader>
          <CardContent>
            <form key={settings?.length || 0} onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">اسم العيادة</label><Input name="clinic_name" defaultValue={settingValue('clinic_name')} /></div>
                <div><label className="block text-sm font-medium mb-1">الهاتف</label><Input name="clinic_phone" defaultValue={settingValue('clinic_phone')} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">العنوان</label><Input name="clinic_address" defaultValue={settingValue('clinic_address')} /></div>
                <div><label className="block text-sm font-medium mb-1">رسوم الكشف</label><Input name="consultation_fee" type="number" defaultValue={settingValue('consultation_fee')} /></div>
                <div><label className="block text-sm font-medium mb-1">رسوم المتابعة</label><Input name="followup_fee" type="number" defaultValue={settingValue('followup_fee')} /></div>
                <div><label className="block text-sm font-medium mb-1">بداية الدوام</label><Input name="working_hours_start" type="time" defaultValue={settingValue('working_hours_start')} /></div>
                <div><label className="block text-sm font-medium mb-1">نهاية الدوام</label><Input name="working_hours_end" type="time" defaultValue={settingValue('working_hours_end')} /></div>
              </div>
              <Button type="submit" icon={Save} loading={saveSettings.isLoading}>حفظ الإعدادات</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
