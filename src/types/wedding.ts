export type ActiveTab = 'bride' | 'together' | 'groom';

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  dressCode: string;
  dressCodeDescription: string;
  dressCodeColors: string[];
  image: string;
  category: 'bride' | 'groom' | 'together';
  description: string;
}

export interface PersonProfile {
  name: string;
  role: string;
  bio: string;
  quote: string;
  image: string;
  instagram?: string;
  hobbies?: string[];
  funFact?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  image: string;
  note: string;
  side: 'bride' | 'groom' | 'together';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'pre-wedding' | 'engagement' | 'sangeet' | 'mandap' | 'together';
  image: string;
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide';
  caption: string;
  side?: 'bride' | 'groom' | 'together';
}

export interface GuestMessage {
  id: string;
  name: string;
  relation: string;
  message: string;
  date: string;
  avatarBg: string;
}

export interface RsvpFormData {
  fullName: string;
  email: string;
  phone: string;
  side: 'bride' | 'groom' | 'both';
  attendingEvents: string[];
  guestCount: number;
  dietaryPreference: 'royal-veg' | 'jain' | 'vegan' | 'non-veg';
  specialRequirements: string;
  blessingMessage: string;
}
