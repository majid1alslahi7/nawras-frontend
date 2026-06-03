import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Pill, Printer } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { openApiFile } from '../../lib/downloads';
import { actionToast as toast } from '../../lib/actionToast';

export default function PrescriptionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetQuery(['prescriptions', { search, page }], `/prescriptions?search=${search}&page=${page}&per_page=20`);

  const handlePrint = async (id) => {
    try {
      await openApiFile(`/prescriptions/${id}/pdf`, `prescription-${id}.pdf`);
    } catch {
      toast.error('تعذرت طباعة الوصفة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">الوصفات</h1><p className="text-[#7E8991] mt-1">الوصفات الطبية للمرضى</p></div>
        <Link to="/prescriptions/new"><Button icon={Plus}>وصفة جديدة</Button></Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" />
        <Input placeholder="بحث عن مريض..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-12 bg-white" />
      </div>

      {isLoading ? <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div> : (
        <div className="space-y-3">
          {data?.data?.map((rx) => (
            <Card key={rx.id} hover>
              <CardContent className="p-5 flex items-center justify-between">
                <Link to={`/prescriptions/${rx.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 bg-[#2E8B73]/8 rounded-2xl flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6 text-[#2E8B73]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#132D42]">{rx.patient?.full_name}</h3>
                    <p className="text-sm text-[#7E8991] mt-1 truncate">{rx.diagnosis}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0 mr-4">
                  <span className="text-xs text-[#7E8991] hidden sm:block">{formatDate(rx.prescription_date)}</span>
                  <Badge variant="muted">{rx.items?.length || 0} أدوية</Badge>
                  <Button variant="outline" size="sm" icon={Printer} onClick={() => handlePrint(rx.id)}>طباعة</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.meta.last_page }, (_, i) => (
            <Button key={i+1} variant={page === i+1 ? 'primary' : 'outline'} size="sm" onClick={() => setPage(i+1)}>{i+1}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
