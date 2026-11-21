import type { Currency, Timestamp } from './common';

export type ClientSource = 'scraper' | 'booking' | 'manual' | 'import';

/**
 * Path: `clients/{clientId}`
 *
 * In v1 one client has one deal, so `stage` and the value fields live together here.
 * Keep them together so a separate deals collection can be split out after v1.
 */
export interface Client {
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  industry: string | null;
  city: string | null;
  country: string | null;
  /** Id of a pipeline stage from `settings/app`. */
  stage: string;
  ownerUid: string;
  teamId: string;
  serviceIds: string[];
  estimatedValue: number | null;
  closedValue: number | null;
  valueCurrency: Currency;
  lossReason: string | null;
  source: ClientSource;
  tags: string[];
  nextFollowUpAt: Timestamp | null;
  /** Lowercase word prefixes used for the MVP search. */
  searchTokens: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** Soft delete: set instead of removing the document. */
  deletedAt: Timestamp | null;
}

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'stage_change';

/** Path: `clients/{clientId}/activities/{activityId}` */
export interface Activity {
  type: ActivityType;
  body: string;
  authorUid: string;
  fromStage: string | null;
  toStage: string | null;
  createdAt: Timestamp;
}
