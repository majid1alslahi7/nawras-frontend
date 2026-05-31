import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarChart3, TrendingUp, Users, Stethoscope, Download } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function ReportsPage() {
  const { data: stats } = useGetQuery('dashboard-stats', '/dashboard/stats');
  const { data: monthly } = useGetQuery('transactions-monthly', '/transactions/summary/monthly');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#132D42]">التقارير</h1>
          <p className="text-[#7E8991] mt-1">تقارير وإحصائيات العيادة</p>
        </div>
        <Button icon={Download} variant="outline">تصدير</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <Users className="w-8 h-8 text-[#153751] mb-3" />
            <p className="text-3xl font-bold text-[#132D42]">{stats?.total_patients || 0}</p>
            <p className="text-sm text-[#7E8991] mt-1">إجمالي المرضى</p>
            <p className="text-xs text-[#2E8B73]">+{stats?.new_patients_this_month || 0} هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Stethoscope className="w-8 h-8 text-[#1E5A78] mb-3" />
            <p className="text-3xl font-bold text-[#132D42]">{stats?.total_visits_this_month || 0}</p>
            <p className="text-sm text-[#7E8991] mt-1">زيارات هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <TrendingUp className="w-8 h-8 text-[#2E8B73] mb-3" />
            <p className="text-3xl font-bold text-[#132D42]">{formatCurrency(stats?.revenue_this_month || 0)}</p>
            <p className="text-sm text-[#7E8991] mt-1">إيرادات الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <BarChart3 className="w-8 h-8 text-[#C89B3C] mb-3" />
            <p className="text-3xl font-bold text-[#132D42]">{formatCurrency(monthly?.net_profit || 0)}</p>
            <p className="text-sm text-[#7E8991] mt-1">صافي أرباح الشهر</p>
          </CardContent>
        </Card>
      </div>

      {monthly?.daily_breakdown && (
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">تفاصيل الأيام</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthly.daily_breakdown.map((day, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#F2EFEE] rounded-2xl">
                  <span className="text-sm text-[#132D42]">{day.date}</span>
                  <div className="flex gap-4">
                    <span className="text-sm text-[#2E8B73]">+{formatCurrency(day.income)}</span>
                    <span className="text-sm text-[#C85C5C]">-{formatCurrency(day.expense)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
