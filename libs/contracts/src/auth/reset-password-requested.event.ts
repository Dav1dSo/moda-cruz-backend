export const RESET_PASSWORD_REQUESTED_EVENT = 'auth.reset-password.requested';

export interface ResetPasswordRequestedEvent {
  to: string;
  name: string;
  resetLink: string;
}
