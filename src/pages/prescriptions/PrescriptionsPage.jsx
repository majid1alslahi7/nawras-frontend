import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Pill, Printer, ChevronLeft } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function PrescriptionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetQuery(['prescriptions', { search, page }], `/prescriptions?search=${search}&page=${page}&per_page=20`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#132D42]">الوصفات</h1>
          <p className="text-[#7E8991] mt-1">الوصفات الطبية للمرضى</p>
        </div>
        <Link to="/prescriptions/new"><Button icon={Plus}>وصفة جديدة</Button></Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" />
        <Input placeholder="بحث عن مريض..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-12 bg-white" />
      </div>

      {isLoading ? <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div> : (
        <div className="space-y-3">
          {data?.data?.map((rx) => (
            <Link key={rx.id} to={`/prescriptions/${rx.id}`}>
              <Card hover className="cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-[#2E8B73]/8 rounded-2xl flex items-center justify-center shrink-0">
                      <Pill className="w-6 h-6 text-[#2E8B73]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#132D42]">{rx.patient?.full_name}</h3>
                      <p className="text-sm text-[#7E8991] mt-1 truncate">{rx.diagnosis}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left hidden sm:block">
                      <span className="text-xs text-[#7E8991] block">التاريخ</span>
                      <span className="text-sm text-[#132D42]">{formatDate(rx.prescription_date)}</span>
                    </div>
                    {rx.is_printed && <Badge variant="success"><Printer className="w-3 h-3" /> تم الطباعة</Badge>}
                    <Badge variant="muted">{rx.items?.length || 0} أدوية</Badge>
                    <ChevronLeft className="w-5 h-5 text-[#C2C0BD]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
