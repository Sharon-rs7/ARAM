export function labelEnum(value = '') {
  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function mapComplaint(apiComplaint) {
  if (!apiComplaint) return null;
  const priority = apiComplaint.priority || apiComplaint.aiResult?.priority || '';
  const category = apiComplaint.category || apiComplaint.aiResult?.category || '';
  const createdAt = apiComplaint.createdAt || apiComplaint.submittedAt || apiComplaint.updatedAt;
  return {
    id: apiComplaint.id,
    code: `CPLT-${String(apiComplaint.id).padStart(4, '0')}`,
    title: apiComplaint.title,
    description: apiComplaint.description,
    category: apiComplaint.categoryLabel || apiComplaint.aiResult?.categoryLabel || labelEnum(category),
    priority: labelEnum(priority),
    priorityScore: apiComplaint.priorityScore || apiComplaint.aiResult?.priorityScore || 0,
    authority: apiComplaint.authority || apiComplaint.aiResult?.recommendedAuthority || '-',
    status: labelEnum(apiComplaint.status),
    filedOn: formatDate(createdAt),
    createdAt,
    sensitive: apiComplaint.sensitive,
    aiResult: apiComplaint.aiResult,
    rawStatus: apiComplaint.status || '',
    rawPriority: priority,
    rawCategory: category,
    raw: apiComplaint,
  };
}

export const priorityRank = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function getPriorityRank(value) {
  const key = String(value || '').replaceAll(' ', '_').toUpperCase();
  return priorityRank[key] || 0;
}

export function getTime(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function priorityTone(priority) {
  const value = String(priority || '').toUpperCase();
  if (value.includes('CRITICAL') || value.includes('HIGH')) return 'danger';
  if (value.includes('MEDIUM')) return 'warning';
  if (value.includes('LOW')) return 'success';
  return 'info';
}

export function statusTone(status) {
  const value = String(status || '').toUpperCase();
  if (value.includes('RESOLVED') || value.includes('CLOSED')) return 'success';
  if (value.includes('REJECTED')) return 'danger';
  if (value.includes('IN PROGRESS') || value.includes('AI') || value.includes('AUTHORITY')) return 'info';
  return 'warning';
}
