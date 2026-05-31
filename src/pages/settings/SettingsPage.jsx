import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#132D42]">الإعدادات</h1>
        <p className="text-[#7E8991] mt-1">إعدادات العيادة والنظام</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-[#153751]"><Settings className="w-5 h-5" /> معلومات العيادة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">اسم العيادة</label>
              <Input defaultValue="عيادة نورس الطبية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">رقم الهاتف</label>
              <Input defaultValue="014567890" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">العنوان</label>
              <Input defaultValue="صنعاء - شارع الزبيري" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">رسوم الكشف (﷼)</label>
              <Input type="number" defaultValue="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">رسوم المتابعة (﷼)</label>
              <Input type="number" defaultValue="3000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">بداية الدوام</label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#132D42] mb-1.5">نهاية الدوام</label>
              <Input type="time" defaultValue="14:00" />
            </div>
          </div>
          <Button icon={Save} className="mt-2">حفظ الإعدادات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
