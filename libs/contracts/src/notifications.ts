export const NOTIFICATIONS_CLIENT = 'NOTIFICATIONS_CLIENT';
export const NOTIFICATIONS_QUEUE = 'notifications_queue';
export const NOTIFICATIONS_DLQ = 'notifications_queue.dlq';

export const NOTIFICATIONS_QUEUE_ARGUMENTS = {
  'x-dead-letter-exchange': '',
  'x-dead-letter-routing-key': NOTIFICATIONS_DLQ,
} as const;
