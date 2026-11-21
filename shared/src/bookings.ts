import type { IsoDate, TimeOfDay, Timestamp } from './common';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeRange {
  start: TimeOfDay;
  end: TimeOfDay;
}

/** A day can hold several ranges. A missing or empty day means not working. */
export type WeeklyHours = Partial<Record<Weekday, TimeRange[]>>;

/**
 * Path: `availability/{uid}`
 *
 * Shared across all of a seller's teams. Buffer, minimum notice and booking window
 * come from `settings/app`.
 */
export interface Availability {
  bookingSlug: string;
  /** IANA time zone of the seller. */
  timezone: string;
  weeklyHours: WeeklyHours;
  /** Call length in minutes, for example 15, 30 or 60. */
  slotMinutes: number;
  daysOff: IsoDate[];
  /** Meeting link shared with clients, or null for phone calls. */
  meetingUrl: string | null;
  paused: boolean;
}

export type BookingStatus = 'confirmed' | 'completed' | 'no-show' | 'cancelled';

/** Path: `bookings/{bookingId}` */
export interface Booking {
  sellerUid: string;
  teamId: string;
  clientId: string;
  serviceId: string | null;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BookingStatus;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message: string | null;
  /** Hash of the random token in the reschedule and cancel links. */
  manageTokenHash: string;
  createdAt: Timestamp;
  cancelledAt: Timestamp | null;
  outcomeNote: string | null;
}
