import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Phone, MapPin, ChevronLeft, Users } from 'lucide-react';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetQuery(['patients', { search, page }], `/patients?search=${search}&page=${page}&per_page=15`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#132D42]">المرضى</h1>
          <p className="text-[#7E8991] mt-1">إدارة سجلات المرضى</p>
        </div>
        <Link to="/patients/new">
          <Button icon={Plus}>مريض جديد</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09E9B]" />
        <Input
          placeholder="بحث باسم المريض أو رقم الهاتف أو رقم الملف..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pr-12 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#7E8991] text-lg">جاري التحميل...</div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map((patient) => (
            <Link key={patient.id} to={`/patients/${patient.id}`}>
              <Card hover className="cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-[#153751]/8 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-[#153751] font-bold text-lg">
                        {patient.full_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#132D42] truncate">{patient.full_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#7E8991] mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                        {patient.address && (
                          <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {patient.address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left hidden sm:block">
                      <span className="text-xs text-[#7E8991] block">رقم الملف</span>
                      <span className="font-mono text-sm text-[#153751] font-semibold">{patient.file_number}</span>
                    </div>
                    {patient.age && (
                      <div className="text-left hidden sm:block">
                        <span className="text-xs text-[#7E8991] block">العمر</span>
                        <span className="text-sm text-[#132D42]">{patient.age} سنة</span>
                      </div>
                    )}
                    {patient.gender && <Badge variant="muted">{patient.gender}</Badge>}
                    {patient.blood_type && <Badge variant="info">{patient.blood_type}</Badge>}
                    <ChevronLeft className="w-5 h-5 text-[#C2C0BD]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {data?.data?.length === 0 && (
            <div className="text-center py-16 text-[#7E8991]">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#E9E5E3]" />
              <p className="text-lg font-medium">لا يوجد مرضى</p>
              <p className="text-sm mt-1">ابدأ بإضافة أول مريض في النظام</p>
            </div>
          )}
        </div>
      )}

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.meta.last_page }, (_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
