export type EventType = 'zsh' | 'app_focus' | 'browser';

export interface StatusResponse {
  schema_version: number | null;
  total_events: number;
  events_by_type: Record<string, number>;
  last_event_ts_by_type: Record<string, number>;
  uptime_seconds: number;
  started_at: number | null;
}

export interface TopRow {
  subject: string | null;
  n: number;
  example: string | null;
  last_ts: number | null;
}
export interface TopResponse {
  type: string;
  days: number;
  rows: TopRow[];
}

export interface TimelineBucket {
  bucket: string;
  n: number;
}
export interface TimelineResponse {
  type: string;
  days: number;
  buckets: TimelineBucket[];
}

export interface RecentEvent {
  id: number;
  ts: number;
  type: string;
  source: string | null;
  subject: string | null;
  detail: string | null;
  payload: string | null;
}
export interface EventsResponse {
  type: string;
  rows: RecentEvent[];
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  status: () => getJson<StatusResponse>('/api/status'),
  top: (type: EventType, days = 14, limit = 30) =>
    getJson<TopResponse>(`/api/top?type=${type}&days=${days}&limit=${limit}`),
  timeline: (type: EventType, days = 7) =>
    getJson<TimelineResponse>(`/api/timeline?type=${type}&days=${days}`),
  events: (type: EventType, limit = 50) =>
    getJson<EventsResponse>(`/api/events?type=${type}&limit=${limit}`),
};
