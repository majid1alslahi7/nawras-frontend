import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetQuery } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Edit, ArrowRight, Phone, MapPin, Calendar, User, Activity, Pill, FlaskConical, FileText } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const { data: patient, isLoading } = useGetQuery(['patient', id], `/patients/${id}`);

  if (isLoading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!patient?.data) return <div className="text-center py-12 text-[#7E8991]">المريض غير موجود</div>;

  const p = patient.data;

  const tabs = [
    { key: 'info', label: 'المعلومات', icon: User },
    { key: 'medical', label: 'التاريخ الطبي', icon: Activity },
    { key: 'visits', label: 'الزيارات', icon: Calendar },
    { key: 'lab', label: 'الفحوصات', icon: FlaskConical },
    { key: 'prescriptions', label: 'الوصفات', icon: Pill },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/patients')}>العودة</Button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#153751]/8 rounded-2xl flex items-center justify-center">
              <span className="text-[#153751] font-bold text-2xl">{p.full_name?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#132D42]">{p.full_name}</h1>
              <p className="text-[#7E8991]">رقم الملف: {p.file_number}</p>
            </div>
          </div>
        </div>
        <Link to={`/patients/${id}/edit`}><Button icon={Edit}>تعديل</Button></Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <Button key={t.key} variant={tab === t.key ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t.key)} icon={t.icon}>{t.label}</Button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-[#153751]">المعلومات الشخصية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-[#7E8991]">الاسم</span><span className="font-medium">{p.full_name}</span></div>
              <div className="flex justify-between"><span className="text-[#7E8991]">رقم الهاتف</span><span className="font-medium" dir="ltr">{p.phone}</span></div>
              {p.phone2 && <div className="flex justify-between"><span className="text-[#7E8991]">رقم بديل</span><span className="font-medium" dir="ltr">{p.phone2}</span></div>}
              <div className="flex justify-between"><span className="text-[#7E8991]">تاريخ الميلاد</span><span className="font-medium">{formatDate(p.birth_date)}</span></div>
              <div className="flex justify-between"><span className="text-[#7E8991]">العمر</span><span className="font-medium">{p.age} سنة</span></div>
              <div className="flex justify-between"><span className="text-[#7E8991]">الجنس</span><Badge>{p.gender}</Badge></div>
              {p.blood_type && <div className="flex justify-between"><span className="text-[#7E8991]">فصيلة الدم</span><Badge variant="info">{p.blood_type}</Badge></div>}
              {p.national_id && <div className="flex justify-between"><span className="text-[#7E8991]">رقم الهوية</span><span className="font-medium">{p.national_id}</span></div>}
              {p.email && <div className="flex justify-between"><span className="text-[#7E8991]">البريد</span><span className="font-medium">{p.email}</span></div>}
              {p.occupation && <div className="flex justify-between"><span className="text-[#7E8991]">المهنة</span><span className="font-medium">{p.occupation}</span></div>}
              {p.marital_status && <div className="flex justify-between"><span className="text-[#7E8991]">الحالة</span><span className="font-medium">{p.marital_status}</span></div>}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-[#153751]">جهة الاتصال والعنوان</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {p.emergency_contact?.name && <div className="flex justify-between"><span className="text-[#7E8991]">اسم جهة الاتصال</span><span className="font-medium">{p.emergency_contact.name}</span></div>}
              {p.emergency_contact?.phone && <div className="flex justify-between"><span className="text-[#7E8991]">هاتف الطوارئ</span><span className="font-medium" dir="ltr">{p.emergency_contact.phone}</span></div>}
              {p.address && <div className="flex justify-between"><span className="text-[#7E8991]">العنوان</span><span className="font-medium">{p.address}</span></div>}
              {p.notes && <div><span className="text-[#7E8991] block mb-1">ملاحظات</span><p className="text-sm bg-[#F2EFEE] p-3 rounded-xl">{p.notes}</p></div>}
            </div>
          </Card>
        </div>
      )}

      {/* Medical History Tab */}
      {tab === 'medical' && (
        <Card>
          <CardHeader><CardTitle className="text-[#153751]">التاريخ الطبي</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['الأمراض المزمنة', p.medical_history?.chronic_diseases],
              ['الحساسية', p.medical_history?.allergies],
              ['العمليات السابقة', p.medical_history?.previous_surgeries],
              ['الأدوية الحالية', p.medical_history?.current_medications],
              ['التاريخ العائلي', p.medical_history?.family_history],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-[#7E8991] mb-1">{label}</p>
                <p className="bg-[#F2EFEE] p-3 rounded-xl text-sm">{value || 'لا يوجد'}</p>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-[#F2EFEE] rounded-xl">
                <p className="text-xs text-[#7E8991]">التدخين</p>
                <p className="font-semibold">{p.medical_history?.smoking_status || '-'}</p>
              </div>
              {p.medical_history?.height_cm && <div className="text-center p-3 bg-[#F2EFEE] rounded-xl"><p className="text-xs text-[#7E8991]">الطول</p><p className="font-semibold">{p.medical_history.height_cm} سم</p></div>}
              {p.medical_history?.weight_kg && <div className="text-center p-3 bg-[#F2EFEE] rounded-xl"><p className="text-xs text-[#7E8991]">الوزن</p><p className="font-semibold">{p.medical_history.weight_kg} كغ</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visits Tab */}
      {tab === 'visits' && (
        <div className="space-y-3">
          {p.recent_visits?.map((v) => (
            <Card key={v.id} hover>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatDate(v.visit_date)}</p>
                  <p className="text-sm text-[#7E8991]">{v.diagnosis_final || v.chief_complaint}</p>
                </div>
                <Badge>{v.status}</Badge>
              </CardContent>
            </Card>
          ))}
          {(!p.recent_visits || p.recent_visits.length === 0) && <p className="text-center text-[#7E8991] py-8">لا توجد زيارات</p>}
        </div>
      )}

      {/* Lab Tab */}
      {tab === 'lab' && <p className="text-center text-[#7E8991] py-8">قسم الفحوصات قيد التطوير</p>}

      {/* Prescriptions Tab */}
      {tab === 'prescriptions' && <p className="text-center text-[#7E8991] py-8">قسم الوصفات قيد التطوير</p>}
    </div>
  );
}
