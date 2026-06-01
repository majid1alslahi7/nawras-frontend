import { useState } from 'react';
import { useGetQuery, useMutate } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Settings, Users, UserPlus, Shield, Save, X, Edit, Trash } from 'lucide-react';

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

  const deleteUser = useMutate('delete', '', {
    invalidate: 'users-list',
    successMessage: 'تم حذف المستخدم',
  });

  const resetForm = () => {
    setForm({ full_name: '', phone: '', email: '', password: '', role: 'nurse' });
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ full_name: user.full_name, phone: user.phone, email: user.email || '', password: '', role: user.role });
    setShowUserModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      deleteUser.mutate({ url: `/users/${id}` });
    }
  };

  const roleLabels = { doctor: 'طبيب', nurse: 'ممرض', admin: 'مدير' };
  const roleColors = { doctor: 'info', nurse: 'success', admin: 'warning' };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-[#132D42]">الإعدادات</h1><p className="text-[#7E8991] mt-1">إدارة المستخدمين وإعدادات النظام</p></div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2">
        <Button variant={tab === 'users' ? 'primary' : 'ghost'} onClick={() => setTab('users')}><Users className="w-4 h-4" /> المستخدمين</Button>
        <Button variant={tab === 'clinic' ? 'primary' : 'ghost'} onClick={() => setTab('clinic')}><Settings className="w-4 h-4" /> العيادة</Button>
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#132D42]">المستخدمين</h2>
            <Button icon={UserPlus} onClick={() => { resetForm(); setShowUserModal(true); }}>إضافة مستخدم</Button>
          </div>

          <div className="space-y-2">
            {users?.data?.map((user) => (
              <Card key={user.id} hover>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#153751]/8 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#153751]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#132D42]">{user.full_name}</p>
                      <p className="text-xs text-[#7E8991]">{user.phone} - {user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                    <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'نشط' : 'غير نشط'}</Badge>
                    <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleEdit(user)} />
                    <Button variant="ghost" size="sm" icon={Trash} className="text-[#C85C5C]" onClick={() => handleDelete(user.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'} size="lg">
            <form onSubmit={(e) => { e.preventDefault(); saveUser.mutate(form); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#132D42] mb-1">الاسم الكامل</label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#132D42] mb-1">رقم الهاتف</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#132D42] mb-1">البريد الإلكتروني</label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#132D42] mb-1">الدور</label>
                  <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">طبيب</option>
                    <option value="nurse">ممرض</option>
                    <option value="admin">مدير</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#132D42] mb-1">كلمة المرور {editingUser && '(اترك فارغاً لعدم التغيير)'}</label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowUserModal(false)} icon={X}>إلغاء</Button>
                <Button type="submit" icon={Save} loading={saveUser.isLoading}>حفظ</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Clinic Settings Tab */}
      {tab === 'clinic' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-[#153751]"><Settings className="w-5 h-5" /> معلومات العيادة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">اسم العيادة</label><Input defaultValue={settings?.find(s => s.setting_key === 'clinic_name')?.setting_value || 'عيادة نورس'} /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">رقم الهاتف</label><Input defaultValue={settings?.find(s => s.setting_key === 'clinic_phone')?.setting_value} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-[#132D42] mb-1">العنوان</label><Input defaultValue={settings?.find(s => s.setting_key === 'clinic_address')?.setting_value} /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">رسوم الكشف (﷼)</label><Input type="number" defaultValue={settings?.find(s => s.setting_key === 'consultation_fee')?.setting_value} /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">رسوم المتابعة (﷼)</label><Input type="number" defaultValue={settings?.find(s => s.setting_key === 'followup_fee')?.setting_value} /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">بداية الدوام</label><Input type="time" defaultValue={settings?.find(s => s.setting_key === 'working_hours_start')?.setting_value} /></div>
              <div><label className="block text-sm font-medium text-[#132D42] mb-1">نهاية الدوام</label><Input type="time" defaultValue={settings?.find(s => s.setting_key === 'working_hours_end')?.setting_value} /></div>
            </div>
            <Button icon={Save}>حفظ الإعدادات</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
