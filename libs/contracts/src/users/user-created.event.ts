export const USER_CREATED_EVENT = 'user.created';

export interface UserCreatedEvent {
  name: string;
  email: string;
  phone: string;
}
