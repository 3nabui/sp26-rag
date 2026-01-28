export type StaffAuditEvent = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: 'view_flagged_chapter';
  scopeKey: string;
  at: string; // ISO
};

const STORAGE_KEY = 'storynest_staff_audit';

function loadAll(): StaffAuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StaffAuditEvent[]) : [];
  } catch {
    return [];
  }
}

function saveAll(events: StaffAuditEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function appendStaffAuditEvent(event: Omit<StaffAuditEvent, 'id'>) {
  const events = loadAll();
  const next: StaffAuditEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...event,
  };
  events.unshift(next);
  saveAll(events.slice(0, 500)); // cap
}

export function getStaffAuditForScope(scopeKey: string) {
  return loadAll().filter((e) => e.scopeKey === scopeKey);
}

