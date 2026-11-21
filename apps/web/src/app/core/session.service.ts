import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Auth, signOut, user } from '@angular/fire/auth';
import {
  collection,
  collectionData,
  doc,
  docData,
  documentId,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import type { Role, Team, UserProfile } from '@klosers/shared';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { readStored, writeStored } from './storage';

export interface TeamOption {
  id: string;
  name: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  team_lead: 'Líder de equipo',
  member: 'Vendedor',
};

const ACTIVE_TEAM_KEY = 'klosers.activeTeam';
const ALL_TEAMS = 'all';

/**
 * Who is signed in, their role and teams, and the team the top bar is working in.
 *
 * The profile and teams come from Firestore. Until the security rules open those paths
 * (Phase 1) the reads fail quietly and the shell shows the plain, member-style layout.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  readonly firebaseUser = toSignal(user(this.auth), { initialValue: null });

  readonly profile = toSignal(
    user(this.auth).pipe(
      switchMap((current) =>
        current
          ? (
              docData(doc(this.firestore, 'users', current.uid)) as Observable<
                UserProfile | undefined
              >
            ).pipe(catchError(() => of(undefined)))
          : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  readonly role = computed<Role | null>(() => this.profile()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');

  readonly displayName = computed(
    () =>
      this.profile()?.displayName ||
      this.firebaseUser()?.displayName ||
      this.firebaseUser()?.email ||
      'Invitado',
  );
  readonly email = computed(() => this.profile()?.email ?? this.firebaseUser()?.email ?? '');
  readonly initials = computed(() => initialsOf(this.displayName()));

  /** Every team the user can pick: all of them for admins, their own for everyone else. */
  readonly teams = toSignal(
    toObservable(this.profile).pipe(
      switchMap((profile) => this.teamsFor(profile)),
      catchError(() => of([] as TeamOption[])),
    ),
    { initialValue: [] as TeamOption[] },
  );

  /** Admins can also work in all teams at once. Members need a picker only with two or more teams. */
  readonly canSwitchTeam = computed(() => this.isAdmin() || this.teams().length > 1);

  private readonly chosenTeam = signal<string>(readStored(ACTIVE_TEAM_KEY) ?? ALL_TEAMS);

  /** The team being worked in, or `null` when an admin views every team. */
  readonly activeTeamId = computed<string | null>(() => {
    const teams = this.teams();
    const chosen = this.chosenTeam();
    if (teams.some((team) => team.id === chosen)) return chosen;
    if (this.isAdmin()) return null;
    return this.profile()?.primaryTeamId ?? teams[0]?.id ?? null;
  });

  readonly activeTeamName = computed(() => {
    const id = this.activeTeamId();
    if (id === null) return this.isAdmin() ? 'Todos los equipos' : '';
    return this.teams().find((team) => team.id === id)?.name ?? '';
  });

  selectTeam(teamId: string | null): void {
    const value = teamId ?? ALL_TEAMS;
    this.chosenTeam.set(value);
    writeStored(ACTIVE_TEAM_KEY, value);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  private teamsFor(profile: UserProfile | undefined): Observable<TeamOption[]> {
    if (!profile) return of([]);
    const source =
      profile.role === 'admin'
        ? collection(this.firestore, 'teams')
        : profile.teamIds.length > 0
          ? query(collection(this.firestore, 'teams'), where(documentId(), 'in', profile.teamIds))
          : null;
    if (!source) return of([]);
    return (
      collectionData(source, { idField: 'id' }) as Observable<(Team & { id: string })[]>
    ).pipe(
      map((teams) =>
        teams
          .map(({ id, name }) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'es-BO')),
      ),
      catchError(() => of([])),
    );
  }
}

export function initialsOf(name: string): string {
  const words = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return words.map((word) => word[0].toUpperCase()).join('') || '?';
}
