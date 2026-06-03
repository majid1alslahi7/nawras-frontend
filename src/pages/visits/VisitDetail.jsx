import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowRight, Printer, Stethoscope, Activity, Pill, FlaskConical } from 'lucide-react';
import { formatDateTime, statusStyles } from '../../lib/utils';
import api, { apiUrl } from '../../services/api';

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/visits/${id}`).then(({ data }) => {
      setVisit(data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!visit) return <div className="text-center py-12 text-[#7E8991]">الزيارة غير موجودة</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/visits')}>العودة</Button>
          <h1 className="text-2xl font-bold text-[#132D42]">تفاصيل الكشف</h1>
        </div>
        <Badge className={statusStyles[visit.status]}>{visit.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5" /> الكشف</CardTitle></CardHeader><CardContent className="space-y-3">
          <Row label="التاريخ" value={formatDateTime(visit.visit_date)} />
          <Row label="المريض" value={<Link to={`/patients/${visit.patient?.id}`} className="text-[#153751] hover:underline">{visit.patient?.full_name}</Link>} />
          <Row label="الطبيب" value={visit.doctor?.full_name} />
          <Row label="الشكوى" value={visit.chief_complaint} />
          <Row label="التشخيص" value={visit.diagnosis_final || visit.diagnosis_initial} />
          {visit.is_free && <Badge variant="success">مجاني</Badge>}
        </CardContent></Card>

        {visit.vitals && (
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> العلامات الحيوية</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3">
            {visit.vitals.temperature && <div className="bg-[#F2EFEE] p-3 rounded-xl text-center"><p className="text-lg font-bold">{visit.vitals.temperature}°</p><p className="text-xs text-[#7E8991]">الحرارة</p></div>}
            {visit.vitals.blood_pressure_sys && <div className="bg-[#F2EFEE] p-3 rounded-xl text-center"><p className="text-lg font-bold">{visit.vitals.blood_pressure_sys}/{visit.vitals.blood_pressure_dia}</p><p className="text-xs text-[#7E8991]">الضغط</p></div>}
            {visit.vitals.heart_rate && <div className="bg-[#F2EFEE] p-3 rounded-xl text-center"><p className="text-lg font-bold">{visit.vitals.heart_rate}</p><p className="text-xs text-[#7E8991]">النبض</p></div>}
            {visit.vitals.oxygen_saturation && <div className="bg-[#F2EFEE] p-3 rounded-xl text-center"><p className="text-lg font-bold">{visit.vitals.oxygen_saturation}%</p><p className="text-xs text-[#7E8991]">الأكسجين</p></div>}
          </CardContent></Card>
        )}
      </div>

      {visit.lab_requests?.length > 0 && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5" /> الفحوصات</CardTitle></CardHeader><CardContent className="space-y-2">
          {visit.lab_requests.map((lr) => <div key={lr.id} className="flex justify-between p-3 bg-[#F2EFEE] rounded-xl"><span>{lr.request_number} - {lr.tests_list?.map(t => t.test_name).join('، ')}</span><Badge>{lr.status}</Badge></div>)}
        </CardContent></Card>
      )}

      {visit.prescriptions?.length > 0 && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Pill className="w-5 h-5" /> الوصفات</CardTitle></CardHeader><CardContent className="space-y-2">
          {visit.prescriptions.map((rx) => (
            <div key={rx.id} className="p-3 bg-[#F2EFEE] rounded-xl">
              <div className="flex justify-between mb-2"><span className="font-mono text-sm text-[#153751]">{rx.prescription_number}</span><span className="text-xs text-[#7E8991]">{formatDateTime(rx.prescription_date)}</span></div>
              <p className="text-sm font-medium">{rx.diagnosis}</p>
              {rx.items?.map((item) => <p key={item.order_number} className="text-xs text-[#7E8991] mr-4 mt-1">{item.order_number}. {item.medication_name} - {item.dosage} {item.frequency}</p>)}
              <Button variant="ghost" size="sm" icon={Printer} onClick={() => window.open(apiUrl(`/prescriptions/${rx.id}/pdf`))} className="mt-2">طباعة</Button>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-[#7E8991] text-sm">{label}</span><span className="font-medium">{value}</span></div>;
}
