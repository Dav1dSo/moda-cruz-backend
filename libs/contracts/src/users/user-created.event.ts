export const USER_CREATED_EVENT = 'user.created';

export interface UserCreatedEvent {
  to: string;
  name: string;
}
