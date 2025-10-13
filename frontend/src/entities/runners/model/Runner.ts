import { Kennel } from '@shared/types/Kennel'

export interface Runner {
    id: number;
    name: string;
    kennel: Kennel,
    image_url: string
  }
  