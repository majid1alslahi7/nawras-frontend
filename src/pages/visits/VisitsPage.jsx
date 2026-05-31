import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Stethoscope, ChevronLeft } from 'lucide-react';
import { formatDate, statusStyles } from '../../lib/utils';

export default function VisitsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetQuery(['visits', { search, filter, page }], `/visits?search=${search}&filter=${filter}&page=${page}&per_page=20`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#132D42]">الكشوفات</h1>
          <p className="text-[#7E8991] mt-1">سجل الزيارات والكشوفات الطبية</p>
        </div>
        <Link to="/visits/new"><Button icon={Plus}>كشف جديد</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" />
          <Input placeholder="بحث عن مريض أو تشخيص..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-12 bg-white" />
        </div>
        <div className="flex gap-2">
          {['all', 'today', 'pending', 'completed'].map((f) => (
            <Button key={f} variant={filter === f ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'الكل' : f === 'today' ? 'اليوم' : f === 'pending' ? 'معلقة' : 'مكتملة'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div> : (
        <div className="space-y-3">
          {data?.data?.map((visit) => (
            <Link key={visit.id} to={`/visits/${visit.id}`}>
              <Card hover className="cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-[#1E5A78]/8 rounded-2xl flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-[#1E5A78]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#132D42]">{visit.patient?.full_name}</h3>
                      <p className="text-sm text-[#7E8991] mt-1 truncate">{visit.diagnosis_initial || visit.chief_complaint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left hidden sm:block">
                      <span className="text-xs text-[#7E8991] block">التاريخ</span>
                      <span className="text-sm text-[#132D42]">{formatDate(visit.visit_date)}</span>
                    </div>
                    <Badge className={statusStyles[visit.status]}>{visit.status}</Badge>
                    <ChevronLeft className="w-5 h-5 text-[#C2C0BD]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {data?.data?.length === 0 && (
            <div className="text-center py-16 text-[#7E8991]">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-[#E9E5E3]" />
              <p className="text-lg font-medium">لا توجد كشوفات</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
