import type { Timestamp } from './common';

export type Role = 'admin' | 'team_lead' | 'member';

export type UserStatus = 'active' | 'deactivated';

/** Per-user switches an admin can turn on (see P5-06). Missing means off. */
export type PermissionKey = 'runScraper' | 'viewTeamTotals' | 'viewLeaderboard';

export type Permissions = Partial<Record<PermissionKey, boolean>>;

/** Path: `users/{uid}` */
export interface UserProfile {
  /** Empty for admins, who belong to no team. */
  teamIds: string[];
  primaryTeamId: string | null;
  displayName: string;
  email: string;
  role: Role;
  permissions: Permissions;
  status: UserStatus;
  lastLoginAt: Timestamp | null;
}

/** Path: `teams/{teamId}` */
export interface Team {
  name: string;
  /** A user leads at most one team. Only a Cloud Function sets this. */
  leadUid: string | null;
  memberCount: number;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

/** Path: `invitations/{inviteId}` */
export interface Invitation {
  email: string;
  role: Role;
  teamId: string | null;
  invitedBy: string;
  expiresAt: Timestamp;
  status: InvitationStatus;
}
