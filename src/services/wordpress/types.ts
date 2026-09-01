interface WPRendered {
  rendered: string;
}

interface WPTerm {
  id: number;
  name: string;
}

interface WPMedia {
  id?: number;
  source_url: string;
  alt_text?: string;
}

export interface WPEmbedded {
  'wp:featuredmedia'?: WPMedia[];
  'wp:term'?: WPTerm[][];
  author?: Array<{ name: string }>;
}

export interface WPPost {
  id: number;
  date: string;
  modified?: string;
  slug: string;
  link: string;
  title: WPRendered;
  excerpt: WPRendered;
  content?: WPRendered;
  _embedded?: WPEmbedded;
}

export interface WPPostsPage {
  posts: WPPost[];
  total: number;
  totalPages: number;
}

/** Evento do WP Event Manager, retornado pela rota customizada `crfal/v1/events`. */
export interface CRFEvent {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Status do post no WordPress: `publish` ou `expired` (encerrado pelo plugin). */
  status: string;
  banner: string | null;
  /** Data/hora local do site WordPress (UTC-3) no formato `YYYY-MM-DD HH:mm:ss`. */
  startDate: string;
  endDate: string;
  location: string;
  online: boolean;
  cancelled: boolean;
  featured: boolean;
  registrationUrl: string;
  videoUrl: string;
  modalidade: string;
  publico: string;
  types: string[];
}

/** Meta exposta pelo snippet `event_details` no endpoint nativo `/wp/v2/event_listing`. */
interface WPEventDetails {
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  online: boolean;
  cancelled: boolean;
  featured: boolean;
  registrationUrl?: string;
  videoUrl?: string;
  modalidade?: string;
  publico?: string;
}

/**
 * Evento individual do endpoint nativo `/wp/v2/event_listing/{id}`.
 * O campo `excerpt` é omitido pela API porque o CPT `event_listing` do
 * WP Event Manager não dá suporte a resumos.
 */
export interface WPEventListing extends Omit<WPPost, 'excerpt'> {
  excerpt?: WPRendered;
  /** Status do post no WordPress: `publish` ou `expired`. */
  status: string;
  event_details?: WPEventDetails;
}
