import { EventItem, FamilyMember, GalleryItem } from '../types/wedding';
import weddingDetailsJson from './json/weddingDetails.json';
import eventsJson from './json/events.json';
import familyJson from './json/family.json';
import galleryJson from './json/gallery.json';

export const WEDDING_DETAILS = weddingDetailsJson;
export const UPLOAD_CONCURRENCY_LIMIT = (weddingDetailsJson as Record<string, any>).uploadConcurrencyLimit || 6;

export const WEDDING_EVENTS: EventItem[] = eventsJson as EventItem[];
export const FAMILY_MEMBERS: FamilyMember[] = familyJson as FamilyMember[];
export const GALLERY_ITEMS: GalleryItem[] = galleryJson as GalleryItem[];
