import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ACTION_NOTICE_EVENT, bindActionNotificationTracking } from '../../lib/actionToast';
import { cn } from '../../lib/utils';

const variants = {
  success: {
    icon: CheckCircle2,
    box: 'border-[#C7E6D9] bg-[#F1FBF6] text-[#184B3B] shadow-[#2E8B73]/10',
    iconBox: 'bg-[#2E8B73] text-white',
    line: 'bg-[#2E8B73]',
  },
  error: {
    icon: XCircle,
    box: 'border-[#F0C9C9] bg-[#FFF7F7] text-[#6D2F2F] shadow-[#C85C5C]/10',
    iconBox: 'bg-[#C85C5C] text-white',
    line: 'bg-[#C85C5C]',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-[#EBD8A7] bg-[#FFF9EA] text-[#684D17] shadow-[#C89B3C]/10',
    iconBox: 'bg-[#C89B3C] text-white',
    line: 'bg-[#C89B3C]',
  },
  info: {
    icon: Info,
    box: 'border-[#C9DCEA] bg-[#F4FAFF] text-[#1F4A63] shadow-[#1E5A78]/10',
    iconBox: 'bg-[#1E5A78] text-white',
    line: 'bg-[#1E5A78]',
  },
};

function getPosition(notice) {
  if (typeof window === 'undefined') return {};

  const margin = 12;
  const width = Math.min(360, window.innerWidth - margin * 2);
  const rect = notice.rect;
  const point = notice.point;
  const sourceX = rect ? rect.left + rect.width / 2 : point?.x || window.innerWidth - 72;
  const sourceY = rect ? rect.bottom : point?.y || 72;

  let left = rect ? rect.right - width : sourceX - width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

  const estimatedHeight = notice.details?.length ? 154 : 112;
  const showBelow = sourceY + estimatedHeight + margin < window.innerHeight;
  const top = rect
    ? (showBelow ? rect.bottom + 12 : rect.top - 12)
    : Math.max(margin, Math.min(sourceY + 12, window.innerHeight - estimatedHeight - margin));

  return {
    width,
    left,
    top,
    transform: rect && !showBelow ? 'translateY(-100%)' : undefined,
    '--arrow-left': `${Math.max(20, Math.min(sourceX - left, width - 20))}px`,
    '--arrow-top': showBelow ? '-7px' : 'auto',
    '--arrow-bottom': showBelow ? 'auto' : '-7px',
  };
}

export default function ActionNotificationHost() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    bindActionNotificationTracking();

    const handleNotice = (event) => {
      setNotice(event.detail);
    };

    window.addEventListener(ACTION_NOTICE_EVENT, handleNotice);
    return () => window.removeEventListener(ACTION_NOTICE_EVENT, handleNotice);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => setNotice(null), notice.duration);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const variant = variants[notice?.type] || variants.info;
  const Icon = variant.icon;
  const style = useMemo(() => (notice ? getPosition(notice) : {}), [notice]);

  if (!notice) return null;

  const details = (notice.details || []).filter((detail) => detail !== notice.message).slice(0, 3);

  return (
    <>
      <style>{`
        @keyframes nawras-action-notice-in {
          from { opacity: 0; transform: translateY(8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nawras-action-notice { animation: nawras-action-notice-in 170ms ease-out; }
        .nawras-action-notice::before {
          content: "";
          position: absolute;
          left: var(--arrow-left);
          top: var(--arrow-top);
          bottom: var(--arrow-bottom);
          width: 14px;
          height: 14px;
          border: inherit;
          border-left: 0;
          border-bottom: 0;
          background: inherit;
          transform: translateX(-50%) rotate(-45deg);
        }
      `}</style>
      <div
        dir="rtl"
        role={notice.type === 'error' ? 'alert' : 'status'}
        className={cn(
          'nawras-action-notice fixed z-[9999] rounded-2xl border p-3 shadow-2xl backdrop-blur-xl',
          'font-["IBM_Plex_Sans_Arabic","Cairo",sans-serif]',
          variant.box,
        )}
        style={style}
      >
        <div className="relative z-10 flex items-start gap-3">
          <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm', variant.iconBox)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold leading-6">{notice.title}</p>
              <button
                type="button"
                className="rounded-full p-1 text-current opacity-55 transition hover:bg-black/5 hover:opacity-100"
                onClick={() => setNotice(null)}
                aria-label="إغلاق الرسالة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-0.5 text-sm leading-6 opacity-90">{notice.message}</p>
            {details.length > 0 && (
              <div className="mt-2 space-y-1 rounded-xl bg-white/55 p-2 text-xs leading-5">
                {details.map((detail) => (
                  <div key={detail} className="flex gap-2">
                    <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', variant.line)} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
