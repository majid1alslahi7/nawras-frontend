import { useGetQuery } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, Calendar, Stethoscope, TrendingUp, TrendingDown, Clock, Banknote } from 'lucide-react';
import { formatCurrency, statusStyles } from '../../lib/utils';

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-[#153751]/8 text-[#153751]',
    green: 'bg-[#2E8B73]/8 text-[#2E8B73]',
    purple: 'bg-[#1E5A78]/8 text-[#1E5A78]',
    red: 'bg-[#C85C5C]/8 text-[#C85C5C]',
    amber: 'bg-[#C89B3C]/8 text-[#C89B3C]',
  };
  return (
    <Card hover>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-[#7E8991]">{label}</p>
          <p className="text-2xl font-bold text-[#132D42]">{value}</p>
          {sub && <p className="text-xs text-[#7E8991] mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: db, isLoading } = useGetQuery('dashboard', '/dashboard');
  const { data: stats } = useGetQuery('dashboard-stats', '/dashboard/stats');
  if (isLoading) return <div className="flex items-center justify-center h-64 text-[#7E8991] text-lg">جاري التحميل...</div>;

  const tf = db?.financial_today;
  const netProfit = (tf?.income || 0) - (tf?.expense || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#132D42]">
          أهلاً، {user?.full_name}
        </h1>
        <p className="text-[#7E8991] mt-1">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="إجمالي المرضى" value={stats?.total_patients || 0} sub={`${stats?.new_patients_this_month || 0} جديد`} color="blue" />
        <StatCard icon={Stethoscope} label="زيارات الشهر" value={stats?.total_visits_this_month || 0} color="purple" />
        <StatCard icon={TrendingUp} label="إيرادات الشهر" value={formatCurrency(stats?.revenue_this_month || 0)} color="green" />
        <StatCard icon={TrendingDown} label="مصروفات الشهر" value={formatCurrency(stats?.expense_this_month || 0)} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#153751]">
              <Calendar className="w-5 h-5" /> ملخص اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'المواعيد', value: db?.today_stats?.appointments || 0, sub: `قيد الانتظار: ${db?.today_stats?.pending_appointments || 0}` },
                { label: 'الكشوفات', value: db?.today_stats?.visits || 0, sub: `مكتمل: ${db?.today_stats?.completed_visits || 0}` },
                { label: 'نتائج معلقة', value: db?.today_stats?.pending_lab_results || 0, sub: `غير طبيعية: ${db?.today_stats?.unreviewed_abnormal_results || 0}` },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-[#F2EFEE] rounded-2xl">
                  <p className="text-3xl font-bold text-[#132D42]">{item.value}</p>
                  <p className="text-sm text-[#7E8991] mt-1">{item.label}</p>
                  <p className="text-xs text-[#7E8991] mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#153751]">
              <Banknote className="w-5 h-5" /> الحركة المالية اليوم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-3 bg-[#2E8B73]/5 rounded-2xl">
              <span className="text-sm text-[#7E8991]">الإيرادات</span>
              <span className="font-bold text-[#2E8B73]">{formatCurrency(tf?.income || 0)}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#C85C5C]/5 rounded-2xl">
              <span className="text-sm text-[#7E8991]">المصروفات</span>
              <span className="font-bold text-[#C85C5C]">{formatCurrency(tf?.expense || 0)}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#153751]/5 rounded-2xl">
              <span className="text-sm font-semibold text-[#153751]">الصافي</span>
              <span className="font-bold text-[#153751]">{formatCurrency(netProfit)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'doctor' && db?.today_appointments && db.today_appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#153751]">
              <Clock className="w-5 h-5" /> مواعيد اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {db.today_appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-[#F2EFEE] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-[#153751]/8 text-[#153751] px-3 py-1.5 rounded-xl font-semibold">
                      {apt.time?.substring(0, 5)}
                    </span>
                    <span className="font-medium text-[#132D42]">{apt.patient_name}</span>
                  </div>
                  <Badge className={statusStyles[apt.status]}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
