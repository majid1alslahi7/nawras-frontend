import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { LogIn, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(phone, password);
      const role = data.user?.role;
      
      toast.success(`مرحباً ${data.user?.full_name}`);
      
      if (role === 'nurse') {
        navigate('/appointments');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'رقم الهاتف أو كلمة المرور غير صحيحة';
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white border border-[#E9E5E3] rounded-3xl p-8 shadow-[0_20px_60px_rgba(19,45,66,0.08)]">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#153751] to-[#1E5A78] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#153751]/20">
          <span className="text-white font-bold text-4xl" style={{ fontFamily: 'serif' }}>ن</span>
        </div>
        <h1 className="text-2xl font-bold text-[#132D42]">عيادة نورس</h1>
        <p className="text-[#7E8991] mt-1">رعايتكم رسالتنا</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#132D42] mb-1.5">رقم الهاتف</label>
          <Input icon={Phone} type="tel" placeholder="777123456" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" className="text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#132D42] mb-1.5">كلمة المرور</label>
          <Input icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="text-left" />
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
