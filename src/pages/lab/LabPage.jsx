import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, FlaskConical, AlertTriangle, FileText, Upload, Printer } from 'lucide-react';
import { formatDate, statusStyles } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

export default function LabPage() {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'doctor';
  const isNurse = user?.role === 'nurse';
  const [tab, setTab] = useState('requests');
  const [search, setSearch] = useState('');
  const { data: requests } = useGetQuery(['lab-requests', { search }], `/lab-requests?search=${search}&per_page=50`);
  const { data: unreviewed } = useGetQuery('lab-unreviewed', '/lab-results/unreviewed');

  const handlePrintRequest = (id) => window.open(`https://nawrasb.alssemam.com/api/lab-requests/${id}/pdf`, '_blank');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#132D42]">الفحوصات</h1><p className="text-[#7E8991] mt-1">طلبات ونتائج الفحوصات المخبرية</p></div>
        <div className="flex gap-2">
          {isDoctor && <Link to="/lab/request/new"><Button icon={Plus}>طلب فحوصات</Button></Link>}
          {isNurse && <Link to="/lab/result/new"><Button icon={Upload}>إدخال نتائج</Button></Link>}
        </div>
      </div>

      {unreviewed?.length > 0 && (
        <Card className="border-[#C89B3C]/30 bg-[#C89B3C]/3">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#C89B3C]" />
            <div>
              <p className="font-semibold text-[#132D42]">نتائج غير طبيعية بانتظار المراجعة</p>
              <p className="text-sm text-[#7E8991]">{unreviewed.length} نتائج بحاجة لمراجعة الطبيب</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2">
        <Button variant={tab === 'requests' ? 'primary' : 'ghost'} onClick={() => setTab('requests')}>طلبات الفحوصات</Button>
        <Button variant={tab === 'results' ? 'primary' : 'ghost'} onClick={() => setTab('results')}>النتائج</Button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-3">
          {requests?.data?.map((req) => (
            <Card key={req.id} hover>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FlaskConical className="w-8 h-8 text-[#1E5A78]" />
                  <div>
                    <h3 className="font-semibold text-[#132D42]">{req.patient?.full_name}</h3>
                    <p className="text-xs text-[#153751] font-mono">{req.request_number}</p>
                    <p className="text-sm text-[#7E8991]">{req.tests_list?.map(t => t.test_name).join('، ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#7E8991]">{formatDate(req.request_date)}</span>
                  <Badge className={statusStyles[req.status]}>{req.status}</Badge>
                  <Button variant="ghost" size="sm" icon={Printer} onClick={() => handlePrintRequest(req.id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
