import type { Timestamp } from './common';

export type ScrapeSource = 'google_places' | 'company_websites' | 'instagram' | 'openai_web_search';

/** Path: `clientTypes/{typeId}` */
export interface ClientType {
  ownerUid: string;
  sharedTeamId: string | null;
  description: string;
  categories: string[];
  locations: string[];
  keywords: string[];
  excludeWords: string[];
  mustHaves: string[];
  sources: ScrapeSource[];
}

export interface ScrapeQuery {
  keywords: string[];
  location: string;
  industry: string | null;
}

export type ScrapeJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Path: `scrapeJobs/{jobId}` */
export interface ScrapeJob {
  createdBy: string;
  source: ScrapeSource;
  query: ScrapeQuery;
  status: ScrapeJobStatus;
  /** Percent complete, 0 to 100. */
  progress: number;
  resultCount: number;
  startedAt: Timestamp | null;
  finishedAt: Timestamp | null;
  error: string | null;
}

export interface NormalizedLead {
  companyName: string;
  contactName: string | null;
  /** Lowercased. */
  email: string | null;
  /** International format. */
  phone: string | null;
  /** Root domain. */
  website: string | null;
  industry: string | null;
  city: string | null;
  country: string | null;
  /** When the lead was collected, kept for compliance. */
  collectedAt: Timestamp;
}

export type LeadReviewStatus = 'pending' | 'accepted' | 'rejected';

/** Path: `scrapeJobs/{jobId}/leads/{leadId}` */
export interface ScrapeLead {
  raw: Record<string, unknown>;
  normalized: NormalizedLead;
  duplicateOfClientId: string | null;
  reviewStatus: LeadReviewStatus;
  reviewedBy: string | null;
}
