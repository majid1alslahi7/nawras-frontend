import { useState } from 'react';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TrendingUp, Users, Stethoscope, Download, Filter } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: financial } = useGetQuery(['financial', month, year], `/reports/financial?month=${month}&year=${year}`);
  const { data: patientStats } = useGetQuery('patient-stats', '/reports/patient-stats');
  const { data: doctorStats } = useGetQuery('doctor-stats', '/reports/doctor-stats');
  const { data: patientsReport } = useGetQuery('patients-report', '/reports/patients');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-[#132D42]">التقارير</h1><p className="text-[#7E8991] mt-1">تقارير وإحصائيات متقدمة</p></div>
        <Button icon={Download} variant="outline">تصدير التقرير</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-[#7E8991]" />
          <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-32">
            {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleDateString('ar-SA', { month: 'long' })}</option>)}
          </Select>
          <Select value={year} onChange={(e) => setYear(e.target.value)} className="w-28">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </CardContent>
      </Card>

      {/* Financial Report */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-[#153751]"><TrendingUp className="w-5 h-5" /> التقرير المالي</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="p-4 bg-[#2E8B73]/5 rounded-2xl"><p className="text-2xl font-bold text-[#2E8B73]">{formatCurrency(financial?.total_income || 0)}</p><p className="text-sm text-[#7E8991]">الإيرادات</p></div>
            <div className="p-4 bg-[#C85C5C]/5 rounded-2xl"><p className="text-2xl font-bold text-[#C85C5C]">{formatCurrency(financial?.total_expense || 0)}</p><p className="text-sm text-[#7E8991]">المصروفات</p></div>
            <div className="p-4 bg-[#153751]/5 rounded-2xl"><p className="text-2xl font-bold text-[#153751]">{formatCurrency(financial?.net_profit || 0)}</p><p className="text-sm text-[#7E8991]">الصافي</p></div>
          </div>
          {financial?.daily_breakdown && (
            <div className="space-y-2">
              <p className="font-semibold text-[#132D42] mb-2">تفاصيل الأيام</p>
              {financial.daily_breakdown.map((day, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#F2EFEE] rounded-2xl">
                  <span className="text-sm text-[#132D42]">{day.date}</span>
                  <div className="flex gap-4"><span className="text-sm text-[#2E8B73]">+{formatCurrency(day.income)}</span><span className="text-sm text-[#C85C5C]">-{formatCurrency(day.expense)}</span></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-[#153751]"><Users className="w-5 h-5" /> إحصائيات المرضى</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#153751]">{patientStats?.total_patients || 0}</p><p className="text-xs text-[#7E8991]">إجمالي المرضى</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#2E8B73]">{patientStats?.new_this_month || 0}</p><p className="text-xs text-[#7E8991]">جدد هذا الشهر</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#1E5A78]">{patientStats?.new_today || 0}</p><p className="text-xs text-[#7E8991]">جدد اليوم</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#C89B3C]">{patientStats?.new_this_week || 0}</p><p className="text-xs text-[#7E8991]">جدد هذا الأسبوع</p></div>
            </div>
            {patientsReport?.by_gender && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold text-sm text-[#132D42]">حسب الجنس</p>
                {patientsReport.by_gender.map((g, i) => (
                  <div key={i} className="flex justify-between text-sm"><span>{g.gender || 'غير محدد'}</span><span className="font-semibold">{g.count}</span></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-[#153751]"><Stethoscope className="w-5 h-5" /> إحصائيات الطبيب</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#153751]">{doctorStats?.visits_today || 0}</p><p className="text-xs text-[#7E8991]">زيارات اليوم</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#2E8B73]">{doctorStats?.completed_today || 0}</p><p className="text-xs text-[#7E8991]">مكتملة اليوم</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#1E5A78]">{doctorStats?.lab_requests_today || 0}</p><p className="text-xs text-[#7E8991]">فحوصات اليوم</p></div>
              <div className="p-3 bg-[#F2EFEE] rounded-2xl"><p className="text-xl font-bold text-[#C89B3C]">{doctorStats?.prescriptions_today || 0}</p><p className="text-xs text-[#7E8991]">وصفات اليوم</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
