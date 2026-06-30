export const NOTIFICATIONS_CLIENT = 'NOTIFICATIONS_CLIENT';
export const NOTIFICATIONS_QUEUE = 'notifications';
export const RESET_PASSWORD_REQUESTED_EVENT = 'auth.reset-password.requested';

export interface ResetPasswordRequestedEvent {
  to: string;
  name: string;
  resetLink: string;
}
