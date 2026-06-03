import api from '../services/api';

function fileNameFromPath(path, fallbackName) {
  if (fallbackName) return fallbackName;

  const cleanPath = String(path).split('?')[0].replace(/\/+$/, '');
  const lastPart = cleanPath.split('/').filter(Boolean).pop();
  return lastPart ? `${lastPart}.pdf` : 'nawras-file.pdf';
}

export async function downloadApiFile(path, fallbackName, mimeType = 'application/octet-stream') {
  const { data, headers } = await api.get(path, { responseType: 'blob' });
  const blob = new Blob([data], { type: headers?.['content-type'] || mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileNameFromPath(path, fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function openApiFile(path, fallbackName, mimeType = 'application/pdf') {
  const { data, headers } = await api.get(path, { responseType: 'blob' });
  const blob = new Blob([data], { type: headers?.['content-type'] || mimeType });
  const url = window.URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');

  if (!opened) {
    await downloadApiFile(path, fallbackName, mimeType);
    window.URL.revokeObjectURL(url);
    return;
  }

  window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}
