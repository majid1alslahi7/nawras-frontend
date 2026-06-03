import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Printer, Pill } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import api, { apiUrl } from '../../services/api';

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/prescriptions/${id}`).then(({ data }) => {
      setRx(data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-[#7E8991]">جاري التحميل...</div>;
  if (!rx) return <div className="text-center py-12 text-[#7E8991]">الوصفة غير موجودة</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/prescriptions')}>العودة</Button>
          <h1 className="text-2xl font-bold text-[#132D42]">تفاصيل الوصفة</h1>
        </div>
        <Button icon={Printer} onClick={() => window.open(apiUrl(`/prescriptions/${rx.id}/pdf`))}>طباعة</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="w-5 h-5" /> {rx.prescription_number}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Row label="المريض" value={rx.patient?.full_name} />
            <Row label="الطبيب" value={rx.doctor?.full_name} />
            <Row label="التاريخ" value={formatDateTime(rx.prescription_date)} />
            <Row label="التشخيص" value={rx.diagnosis} />
          </div>
          <div className="border-t border-[#E9E5E3] pt-4">
            <p className="font-semibold mb-3">الأدوية:</p>
            {rx.items?.map((item) => (
              <div key={item.order_number} className="bg-[#F2EFEE] p-3 rounded-xl mb-2">
                <p className="font-medium">{item.order_number}. {item.medication_name} {item.concentration}</p>
                <p className="text-sm text-[#7E8991]">💊 {item.dosage} | 🕐 {item.frequency} | 📅 {item.duration}</p>
                <p className="text-xs text-[#7E8991]">📦 {item.quantity} | 🍽️ {item.timing}</p>
              </div>
            ))}
          </div>
          {rx.notes && <div className="bg-blue-50 p-3 rounded-xl"><p className="text-sm font-medium">📝 تعليمات:</p><p>{rx.notes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-[#7E8991] text-sm">{label}</span><span className="font-medium">{value}</span></div>;
}
