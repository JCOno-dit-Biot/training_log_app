export type SportType = 'dryland' | 'on-snow';

export interface Sport {
  id: number;
  name: string;
  type: SportType;
  display_mode: string;
}
