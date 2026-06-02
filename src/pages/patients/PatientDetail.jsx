import { useParams, Link } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowRight, Edit, Phone, MapPin, Calendar, Stethoscope, FlaskConical, Pill } from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/utils';

export default function PatientDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetQuery(['patient', id], `/patients/${id}`);
  const patient = data?.data;

  if (isLoading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!patient) return <div className="text-center py-12 text-[#C85C5C]">المريض غير موجود</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/patients"><Button variant="ghost" icon={ArrowRight} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-[#132D42]">{patient.full_name}</h1>
            <p className="text-[#7E8991]">رقم الملف: {patient.file_number}</p>
          </div>
        </div>
        <Link to={`/patients/${id}/edit`}><Button icon={Edit}>تعديل</Button></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-[#153751]">معلومات شخصية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#7E8991]">الهاتف</span><span className="font-medium">{patient.phone}</span></div>
          <div className="flex justify-between"><span className="text-[#7E8991]">العمر</span><span className="font-medium">{patient.age} سنة</span></div>
          <div className="flex justify-between"><span className="text-[#7E8991]">الجنس</span><span className="font-medium">{patient.gender}</span></div>
          <div className="flex justify-between"><span className="text-[#7E8991]">فصيلة الدم</span><span className="font-medium">{patient.blood_type || '-'}</span></div>
          {patient.address && <div className="flex justify-between"><span className="text-[#7E8991]">العنوان</span><span className="font-medium text-left">{patient.address}</span></div>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-[#153751]">التاريخ الطبي</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div><span className="text-[#7E8991]">الأمراض المزمنة:</span><p className="font-medium">{patient.medical_history?.chronic_diseases || 'لا يوجد'}</p></div>
          <div><span className="text-[#7E8991]">الحساسية:</span><p className="font-medium text-[#C85C5C]">{patient.medical_history?.allergies || 'لا يوجد'}</p></div>
          <div><span className="text-[#7E8991]">العمليات:</span><p className="font-medium">{patient.medical_history?.previous_surgeries || 'لا يوجد'}</p></div>
          <div><span className="text-[#7E8991]">التدخين:</span><p className="font-medium">{patient.medical_history?.smoking_status}</p></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-[#153751]">آخر الزيارات</CardTitle></CardHeader><CardContent className="space-y-2">
          {patient.recent_visits?.slice(0, 5).map((v, i) => (
            <div key={i} className="flex justify-between text-sm p-2 bg-[#F2EFEE] rounded-xl">
              <span>{formatDateTime(v.visit_date)}</span>
              <Badge variant={v.status === 'مكتمل' ? 'success' : 'warning'}>{v.status}</Badge>
            </div>
          )) || <p className="text-[#7E8991]">لا توجد زيارات</p>}
        </CardContent></Card>
      </div>
    </div>
  );
}
