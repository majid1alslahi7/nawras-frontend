import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FlaskConical, Printer, Upload } from 'lucide-react';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime, statusStyles } from '../../lib/utils';
import { openApiFile } from '../../lib/downloads';
import { toast } from 'sonner';

export default function LabRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetQuery(['lab-request', id], `/lab-requests/${id}`);
  const request = data?.data || data;

  if (isLoading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!request) return <div className="text-center py-12 text-[#7E8991]">طلب الفحوصات غير موجود</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/lab')}>العودة</Button>
          <div>
            <h1 className="text-2xl font-bold text-[#132D42]">تفاصيل طلب الفحوصات</h1>
            <p className="text-sm text-[#7E8991]">{request.request_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/lab/result/new/${request.id}`}><Button variant="outline" icon={Upload}>إدخال نتيجة</Button></Link>
          <Button icon={Printer} onClick={() => openApiFile(`/lab-requests/${request.id}/pdf`, `lab-request-${request.id}.pdf`).catch(() => toast.error('تعذرت طباعة طلب الفحوصات'))}>طباعة الطلب</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Info label="المريض" value={request.patient ? <Link to={`/patients/${request.patient.id}`} className="text-[#153751] hover:underline">{request.patient.full_name}</Link> : '-'} />
        <Info label="الطبيب" value={request.doctor?.full_name || '-'} />
        <Info label="تاريخ الطلب" value={formatDateTime(request.request_date)} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5" /> الفحوصات المطلوبة</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {request.tests_list?.map((test, index) => (
            <div key={`${test.test_name}-${index}`} className="flex items-center justify-between bg-[#F2EFEE] rounded-2xl p-3">
              <span className="font-medium text-[#132D42]">{index + 1}. {test.test_name}</span>
              <span className="text-xs text-[#7E8991]">{test.category || 'غير مصنف'}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>الحالة والملاحظات</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge className={statusStyles[request.status]}>{request.status}</Badge>
          <div className="bg-[#F2EFEE] rounded-2xl p-4">{request.clinical_diagnosis || 'لا يوجد تشخيص سريري'}</div>
          {request.notes && <div className="bg-white border border-[#E9E5E3] rounded-2xl p-4">{request.notes}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-[#7E8991]">{label}</p><div className="font-semibold text-[#132D42] mt-1">{value}</div></CardContent></Card>;
}
