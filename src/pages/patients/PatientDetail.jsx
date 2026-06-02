import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Edit, ArrowRight, User, Activity, Calendar, FlaskConical, Pill } from 'lucide-react';
import { formatDate, statusStyles } from '../../lib/utils';
import api from '../../services/api';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${id}`).then(({ data }) => {
      setPatient(data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!patient) return <div className="text-center py-12 text-[#7E8991]">المريض غير موجود</div>;

  const p = patient;

  return (
    <div className="space-y-6">
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

      <div className="flex gap-2 border-b border-[#E9E5E3] pb-2 overflow-x-auto">
        {[{ key: 'info', label: 'المعلومات', icon: User }, { key: 'medical', label: 'التاريخ الطبي', icon: Activity }, { key: 'visits', label: 'الزيارات', icon: Calendar }, { key: 'lab', label: 'الفحوصات', icon: FlaskConical }, { key: 'prescriptions', label: 'الوصفات', icon: Pill }].map((t) => (
          <Button key={t.key} variant={tab === t.key ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t.key)} icon={t.icon}>{t.label}</Button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>معلومات شخصية</CardTitle></CardHeader><CardContent className="space-y-3">
            <Row label="الاسم" value={p.full_name} /><Row label="الهاتف" value={p.phone} dir="ltr" />
            {p.phone2 && <Row label="هاتف بديل" value={p.phone2} dir="ltr" />}
            <Row label="تاريخ الميلاد" value={formatDate(p.birth_date)} /><Row label="العمر" value={`${p.age} سنة`} />
            <Row label="الجنس" value={<Badge>{p.gender}</Badge>} />{p.blood_type && <Row label="فصيلة الدم" value={<Badge variant="info">{p.blood_type}</Badge>} />}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>جهة اتصال وعنوان</CardTitle></CardHeader><CardContent className="space-y-3">
            {p.emergency_contact?.name && <Row label="اسم جهة الاتصال" value={p.emergency_contact.name} />}
            {p.emergency_contact?.phone && <Row label="هاتف الطوارئ" value={p.emergency_contact.phone} dir="ltr" />}
            {p.address && <Row label="العنوان" value={p.address} />}
            {p.notes && <div><span className="text-[#7E8991] block mb-1">ملاحظات</span><p className="bg-[#F2EFEE] p-3 rounded-xl text-sm">{p.notes}</p></div>}
          </CardContent></Card>
        </div>
      )}

      {tab === 'medical' && (
        <Card><CardHeader><CardTitle>التاريخ الطبي</CardTitle></CardHeader><CardContent className="space-y-4">
          {[['الأمراض المزمنة', p.medical_history?.chronic_diseases], ['الحساسية', p.medical_history?.allergies], ['العمليات السابقة', p.medical_history?.previous_surgeries], ['الأدوية الحالية', p.medical_history?.current_medications]].map(([l, v]) => <div key={l}><p className="text-sm text-[#7E8991] mb-1">{l}</p><p className="bg-[#F2EFEE] p-3 rounded-xl text-sm">{v || 'لا يوجد'}</p></div>)}
        </CardContent></Card>
      )}

      {tab === 'visits' && <PatientVisits patientId={id} />}
      {tab === 'lab' && <PatientLab patientId={id} />}
      {tab === 'prescriptions' && <PatientPrescriptions patientId={id} />}
    </div>
  );
}

function Row({ label, value, dir }) {
  return <div className="flex justify-between items-center"><span className="text-[#7E8991] text-sm">{label}</span><span className={`font-medium ${dir === 'ltr' ? 'dir-ltr text-left' : ''}`}>{value}</span></div>;
}

function PatientVisits({ patientId }) {
  const [visits, setVisits] = useState([]);
  useEffect(() => { api.get(`/visits?patient_id=${patientId}&per_page=50`).then(({ data }) => setVisits(data.data || data)); }, [patientId]);
  if (!visits.length) return <p className="text-center text-[#7E8991] py-8">لا توجد زيارات</p>;
  return <div className="space-y-2">{visits.map((v) => <Card key={v.id} hover><CardContent className="p-4 flex justify-between"><div><p className="font-medium">{formatDate(v.visit_date)}</p><p className="text-sm text-[#7E8991]">{v.diagnosis_final || v.chief_complaint}</p></div><Badge className={statusStyles[v.status]}>{v.status}</Badge></CardContent></Card>)}</div>;
}

function PatientLab({ patientId }) {
  const [requests, setRequests] = useState([]);
  useEffect(() => { api.get(`/lab-requests?patient_id=${patientId}`).then(({ data }) => setRequests(data.data || data)); }, [patientId]);
  if (!requests.length) return <p className="text-center text-[#7E8991] py-8">لا توجد فحوصات</p>;
  return <div className="space-y-2">{requests.map((r) => <Card key={r.id} hover><CardContent className="p-4 flex justify-between"><div><p className="font-medium">{formatDate(r.request_date)}</p><p className="text-sm text-[#7E8991]">{r.tests_list?.map(t => t.test_name).join('، ')}</p></div><Badge className={statusStyles[r.status]}>{r.status}</Badge></CardContent></Card>)}</div>;
}

function PatientPrescriptions({ patientId }) {
  const [rx, setRx] = useState([]);
  useEffect(() => { api.get(`/prescriptions?patient_id=${patientId}`).then(({ data }) => setRx(data.data || data)); }, [patientId]);
  if (!rx.length) return <p className="text-center text-[#7E8991] py-8">لا توجد وصفات</p>;
  return <div className="space-y-2">{rx.map((r) => <Card key={r.id} hover><CardContent className="p-4 flex justify-between"><div><p className="font-medium">{formatDate(r.prescription_date)}</p><p className="text-sm text-[#7E8991]">{r.diagnosis}</p></div><Badge variant="muted">{r.items?.length || 0} أدوية</Badge></CardContent></Card>)}</div>;
}
