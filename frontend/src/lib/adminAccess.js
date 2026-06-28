const STAFF_ROLES = new Set(['admin', 'recruiter', 'content_editor']);

export function canAccessAdmin(user) {
  return Boolean(user && STAFF_ROLES.has(user.role));
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function canManageRecruitment(user) {
  return user?.role === 'admin' || user?.role === 'recruiter';
}

export function canManageInsights(user) {
  return user?.role === 'admin' || user?.role === 'content_editor';
}

export function canManageUsers(user) {
  return user?.role === 'admin';
}

export const USER_ROLES = [
  { value: 'public', label: 'Public' },
  { value: 'talent', label: 'Talent' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'content_editor', label: 'Content editor' },
  { value: 'admin', label: 'Admin' },
];

export const APPLICATION_STATUSES = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

export function formatRoleLabel(role) {
  return USER_ROLES.find((item) => item.value === role)?.label || role;
}

export function formatStatusLabel(status) {
  return APPLICATION_STATUSES.find((item) => item.value === status)?.label || status;
}
