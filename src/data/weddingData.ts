import { EventItem, PersonProfile, FamilyMember, GalleryItem, GuestMessage } from '../types/wedding';
import weddingDetailsJson from './json/weddingDetails.json';
import eventsJson from './json/events.json';
import familyJson from './json/family.json';
import galleryJson from './json/gallery.json';
import guestbookJson from './json/guestbook.json';

export const WEDDING_DETAILS = weddingDetailsJson;
export const UPLOAD_CONCURRENCY_LIMIT = (weddingDetailsJson as Record<string, any>).uploadConcurrencyLimit || 6;

export const BRIDE_PROFILE: PersonProfile = {
  name: 'Kanishka Dhir',
  role: 'The Bride',
  bio: 'A visionary designer with an eye for timeless grace and warm hospitality. Kanishka brings vibrant energy, artistry, and laughter into every room she enters.',
  quote: '"From our first coffee in Mumbai to standardizing our future in Rajasthan, loving Arjun has been the easiest, most beautiful decision of my life."',
  image: '/images/bride_portrait.jpg',
  funFact: 'Can name every vintage Indian classical raaga within three seconds.',
  hobbies: ['Classical Kathak', 'Architectural Sketching', 'Chai Connoisseur']
};

export const GROOM_PROFILE: PersonProfile = {
  name: 'Arjun Puri',
  role: 'The Groom',
  bio: 'A technology entrepreneur known for his warm heart, sharp intellect, and steadfast devotion to family. Arjun finds his true home whenever Kanishka is near.',
  quote: '"Kanishka is my anchor, my spark, and my greatest adventure. I cannot wait to walk around the sacred fire and spend forever by her side."',
  image: '/images/groom_portrait.jpg',
  funFact: 'Spent 4 months secretly orchestrating a surprise flash mob proposal in Lake Como.',
  hobbies: ['Stargazing', 'Sitar Melodies', 'Heritage Restoration']
};

export const TOGETHER_PROFILE: PersonProfile = {
  name: 'Arjun & Kanishka',
  role: 'The Royal Couple',
  bio: 'Bound by deep-rooted heritage and modern ambition, Arjun & Kanishka celebrate 6 years of laughter, shared dreams, and quiet sunsets before stepping into forever.',
  quote: '"Two souls, one heart, a lifetime of royal celebrations. Welcome to our sacred union."',
  image: '/images/hero_couple.jpg',
  funFact: 'Their names combine to form "AK" - symbolizing timeless strength and grace.',
  hobbies: ['Royal Heritage Walks', 'Gourmet Indian Cuisine', 'Curating Art']
};

export const WEDDING_EVENTS: EventItem[] = eventsJson as EventItem[];
export const FAMILY_MEMBERS: FamilyMember[] = familyJson as FamilyMember[];
export const GALLERY_ITEMS: GalleryItem[] = galleryJson as GalleryItem[];
export const INITIAL_GUESTBOOK: GuestMessage[] = guestbookJson as GuestMessage[];
