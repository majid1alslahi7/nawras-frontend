const ACTION_NOTICE_EVENT = 'nawras:action-notice';
const ACTION_SELECTOR = 'button,a,[role="button"],input,select,textarea,[data-action-anchor]';

let lastAnchor = null;
let lastPoint = null;
let trackingStarted = false;

const fieldLabels = {
  phone: 'رقم الهاتف',
  password: 'كلمة المرور',
  email: 'البريد الإلكتروني',
  full_name: 'الاسم',
  patient_id: 'المريض',
  doctor_id: 'الطبيب',
  appointment_date: 'تاريخ الموعد',
  appointment_time: 'وقت الموعد',
  chief_complaint: 'الشكوى الرئيسية',
  diagnosis: 'التشخيص',
  amount: 'المبلغ',
  transaction_type: 'نوع المعاملة',
  category_id: 'التصنيف',
  payment_method: 'طريقة الدفع',
  lab_request_id: 'طلب الفحوصات',
  results_json: 'نتائج الفحوصات',
  tests_list_json: 'قائمة الفحوصات',
  items: 'الأدوية',
};

function closestActionElement(target) {
  return target?.closest?.(ACTION_SELECTOR) || null;
}

function rememberAction(target, point = null) {
  const anchor = closestActionElement(target);
  if (anchor) lastAnchor = anchor;
  if (point) lastPoint = point;
}

function readableFieldName(element) {
  const labelledBy = element?.getAttribute?.('aria-labelledby');
  if (labelledBy) {
    const label = document.getElementById(labelledBy)?.textContent?.trim();
    if (label) return label;
  }

  const id = element?.getAttribute?.('id');
  if (id) {
    const escapedId = window.CSS?.escape ? window.CSS.escape(id) : id.replace(/"/g, '\\"');
    const label = document.querySelector(`label[for="${escapedId}"]`)?.textContent?.trim();
    if (label) return label;
  }

  const parentLabel = element?.closest?.('label')?.textContent?.trim();
  if (parentLabel) return parentLabel;

  const nearbyLabel = element?.closest?.('div')?.querySelector?.('label')?.textContent?.trim();
  if (nearbyLabel) return nearbyLabel;

  let container = element?.parentElement;
  for (let depth = 0; depth < 3 && container; depth += 1) {
    const label = container.querySelector?.('label')?.textContent?.trim();
    if (label) return label;
    container = container.parentElement;
  }

  return element?.getAttribute?.('placeholder') || fieldLabel(element?.name) || 'هذا الحقل';
}

function nativeValidationMessage(element) {
  const label = readableFieldName(element);
  const validity = element?.validity;
  const requiredWord = /ة$|كلمة|طريقة|قائمة|نتيجة|وصفة|شكوى/.test(label) ? 'مطلوبة' : 'مطلوب';

  if (validity?.valueMissing) return `${label} ${requiredWord}`;
  if (validity?.typeMismatch) return `${label} غير مكتوب بصيغة صحيحة`;
  if (validity?.tooShort) return `${label} قصير جدًا`;
  if (validity?.tooLong) return `${label} طويل جدًا`;
  if (validity?.rangeUnderflow) return `${label} أقل من الحد المسموح`;
  if (validity?.rangeOverflow) return `${label} أكبر من الحد المسموح`;
  if (validity?.patternMismatch) return `${label} لا يطابق الصيغة المطلوبة`;

  return element?.validationMessage || `${label} غير صحيح`;
}

export function bindActionNotificationTracking() {
  if (trackingStarted || typeof document === 'undefined') return;
  trackingStarted = true;

  document.addEventListener('pointerdown', (event) => {
    rememberAction(event.target, { x: event.clientX, y: event.clientY });
  }, true);

  document.addEventListener('submit', (event) => {
    if (event.submitter) rememberAction(event.submitter);
  }, true);

  document.addEventListener('focusin', (event) => {
    rememberAction(event.target);
  }, true);

  document.addEventListener('invalid', (event) => {
    event.preventDefault();
    rememberAction(event.target);
    emit('error', nativeValidationMessage(event.target), {
      title: 'راجع الحقل المطلوب',
      anchor: event.target,
      duration: 4200,
    });
  }, true);
}

function fieldLabel(field = '') {
  const clean = String(field).replace(/\.\d+/g, '').replace(/\..+$/, '');
  return fieldLabels[clean] || fieldLabels[field] || null;
}

function flattenErrors(errors) {
  if (!errors || typeof errors !== 'object') return [];

  return Object.entries(errors).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    const label = fieldLabel(field);

    return messages
      .filter(Boolean)
      .map((message) => {
        const text = String(message);
        return label && !text.includes(label) ? `${label}: ${text}` : text;
      });
  });
}

function uniqueMessages(messages) {
  return [...new Set(messages.map((message) => String(message).trim()).filter(Boolean))];
}

export function formatApiError(error) {
  const response = error?.response;
  const data = response?.data || {};
  const details = uniqueMessages(flattenErrors(data.errors));
  const status = response?.status;
  const networkMessage = error?.code === 'ERR_NETWORK'
    ? 'تعذر الاتصال بالخادم. تحقق من الإنترنت أو رابط النظام.'
    : null;

  if (status === 422 && details.length) {
    return {
      title: 'راجع البيانات المدخلة',
      message: details[0],
      details,
    };
  }

  if (status === 401) {
    return {
      title: 'تعذر تسجيل الدخول',
      message: data.message || 'بيانات الدخول غير صحيحة.',
      details,
    };
  }

  if (status === 403) {
    return {
      title: 'لا توجد صلاحية',
      message: data.message || 'هذه العملية غير متاحة لحسابك الحالي.',
      details,
    };
  }

  if (status >= 500) {
    return {
      title: 'تعذر تنفيذ العملية',
      message: data.message || 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.',
      details,
    };
  }

  return {
    title: data.title || 'تعذر تنفيذ العملية',
    message: networkMessage || data.message || error?.message || 'حدث خطأ غير متوقع.',
    details,
  };
}

function anchorRect(anchor) {
  if (!anchor?.isConnected) return null;
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function emit(type, input, options = {}) {
  if (typeof window === 'undefined') return;

  const formatted = input?.response || input?.isAxiosError
    ? formatApiError(input)
    : { title: options.title, message: input, details: options.details || [] };

  const anchor = options.anchor || lastAnchor;
  window.dispatchEvent(new CustomEvent(ACTION_NOTICE_EVENT, {
    detail: {
      id: Date.now() + Math.random(),
      type,
      title: options.title || formatted.title,
      message: formatted.message,
      details: formatted.details || [],
      duration: options.duration ?? (type === 'error' ? 5200 : 3600),
      rect: anchorRect(anchor),
      point: lastPoint,
    },
  }));
}

export const actionToast = {
  success(message, options) {
    emit('success', message, { title: 'تمت العملية', ...options });
  },
  error(error, options) {
    emit('error', error, options);
  },
  warning(message, options) {
    emit('warning', message, { title: 'تنبيه', ...options });
  },
  info(message, options) {
    emit('info', message, { title: 'معلومة', ...options });
  },
};

export { ACTION_NOTICE_EVENT };
