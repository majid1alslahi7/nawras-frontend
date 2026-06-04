import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogIn, Phone, Lock } from 'lucide-react';
import NawrasLogo from '../../components/brand/NawrasLogo';
import { actionToast } from '../../lib/actionToast';

const roleLabels = {
  doctor: 'طبيبة',
  nurse: 'ممرضة',
  admin: 'مدير',
};

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedPhone = String(formData.get('phone') || phone).trim();
    const submittedPassword = String(formData.get('password') || password);

    try {
      const data = await login(submittedPhone, submittedPassword);
      const role = data.user.role;

      actionToast.success(`أهلاً ${data.user.full_name}، سيتم فتح النظام الآن.`, {
        title: `تم تسجيل الدخول كـ ${roleLabels[role] || role}`,
        duration: 1400,
      });

      await wait(900);
      
      if (role === 'nurse') {
        window.location.replace('/appointments');
      } else {
        window.location.replace('/dashboard');
      }
      
    } catch (error) {
      actionToast.error(error);
    }
  };

  return (
    <div className="bg-white border border-[#E9E5E3] rounded-3xl p-8 shadow-[0_20px_60px_rgba(19,45,66,0.08)]">
      <div className="text-center mb-8">
        <NawrasLogo size="lg" className="mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-[#132D42]">عيادة النورس</h1>
        <p className="text-[#7E8991] mt-1">رعايتكم رسالتنا</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#132D42] mb-1.5">رقم الهاتف</label>
          <Input name="phone" autoComplete="tel" icon={Phone} type="tel" placeholder="777123456" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" className="text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#132D42] mb-1.5">كلمة المرور</label>
          <Input name="password" autoComplete="current-password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="text-left" />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isLoading} icon={LogIn}>تسجيل الدخول</Button>
      </form>

      <div className="mt-6 p-4 bg-[#F2EFEE] rounded-2xl text-xs space-y-1.5">
        <p className="font-semibold text-[#153751] mb-2">بيانات تجريبية</p>
        <p className="text-[#7E8991]">طبيبة: <code className="bg-white px-2 py-0.5 rounded-lg text-[#153751] font-mono">777123456</code></p>
        <p className="text-[#7E8991]">ممرضة: <code className="bg-white px-2 py-0.5 rounded-lg text-[#153751] font-mono">777987654</code></p>
        <p className="text-[#7E8991]">مدير: <code className="bg-white px-2 py-0.5 rounded-lg text-[#153751] font-mono">777555555</code></p>
        <p className="text-[#7E8991] mt-1">كلمة المرور: <code className="bg-white px-2 py-0.5 rounded-lg text-[#153751] font-mono">password123</code></p>
      </div>
    </div>
  );
}
