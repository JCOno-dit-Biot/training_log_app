import { Kennel } from "./Kennel";

export interface Dog {
    id: number;
    name: string;
    breed: string;
    date_of_birth: string; // ISO string
    kennel: Kennel
    image_url: string
  }
  