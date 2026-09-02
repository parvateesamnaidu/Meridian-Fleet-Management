export interface QueuedEvent {
  event_id: string;
  case_id: string;
  vessel_id: string;
  event_type: string;
  sequence_no: number;
  dedupe_key: string;
  timestamp_utc: string;
  status: 'QUEUED' | 'PROCESSED' | 'DEDUPED';
  source: string;
}

const OFFLINE_QUEUE_KEY = 'meridian_offline_events_queue_v2';
const PROCESSED_DEDUPE_KEYS = 'meridian_dedupe_keys_v2';

export function getOfflineQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      event_id: 'EVT-OFFLINE-001',
      case_id: 'MFD-L014',
      vessel_id: 'V-35',
      event_type: 'LOCAL_BEARING_TEMP_CHECK',
      sequence_no: 801,
      dedupe_key: 'V-35|EVT-OFFLINE-001',
      timestamp_utc: '2026-09-15T08:35:00Z',
      status: 'QUEUED',
      source: 'VESSEL_EDGE_LOCAL_SENSOR',
    },
    {
      event_id: 'EVT-OFFLINE-002',
      case_id: 'MFD-L014',
      vessel_id: 'V-35',
      event_type: 'MASTER_SPEED_HOLD_LOG',
      sequence_no: 802,
      dedupe_key: 'V-35|EVT-OFFLINE-002',
      timestamp_utc: '2026-09-15T08:40:00Z',
      status: 'QUEUED',
      source: 'VESSEL_BRIDGE_LOG',
    },
  ];
}

export function saveOfflineQueue(queue: QueuedEvent[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function getProcessedDedupeKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_DEDUPE_KEYS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set(['V-06|EVT-LIVE-001', 'V-14|EVT-LIVE-002', 'V-15|EVT-LIVE-003', 'V-22|EVT-LIVE-007']);
}

export function saveProcessedDedupeKeys(keys: Set<string>) {
  try {
    localStorage.setItem(PROCESSED_DEDUPE_KEYS, JSON.stringify(Array.from(keys)));
  } catch {}
}

export function processEventWithDeduplication(event: QueuedEvent): { processed: boolean; reason: string } {
  const processedKeys = getProcessedDedupeKeys();
  if (processedKeys.has(event.dedupe_key)) {
    return {
      processed: false,
      reason: `Event deduplicated by key [${event.dedupe_key}]. Zero duplicate operational actions committed.`,
    };
  }

  processedKeys.add(event.dedupe_key);
  saveProcessedDedupeKeys(processedKeys);
  return {
    processed: true,
    reason: `Event [${event.event_id}] ingested and committed with dedupe key [${event.dedupe_key}].`,
  };
}

export function reconcileOfflineReplay(): { reconciledCount: number; dedupedCount: number; logs: string[] } {
  const queue = getOfflineQueue();
  const logs: string[] = [];
  let reconciledCount = 0;
  let dedupedCount = 0;

  const processedQueue = queue.map((evt) => {
    const res = processEventWithDeduplication(evt);
    if (res.processed) {
      reconciledCount++;
      logs.push(`[RECONCILED] ${evt.event_id} (Seq: ${evt.sequence_no}) synced to shore database.`);
      return { ...evt, status: 'PROCESSED' as const };
    } else {
      dedupedCount++;
      logs.push(`[DEDUPED] ${evt.event_id} - ${res.reason}`);
      return { ...evt, status: 'DEDUPED' as const };
    }
  });

  saveOfflineQueue(processedQueue);
  return { reconciledCount, dedupedCount, logs };
}
