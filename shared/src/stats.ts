export type StatsScope = 'company' | 'team' | 'user';

export interface ServiceStats {
  wonValue: number;
  wonCount: number;
}

/**
 * Path: `stats/{scope_period}`
 *
 * `scopeId` is the team or user id and is null for the company scope. The planning
 * document names the path `{scope_period}`; include the scope id in the document id
 * for team and user scopes so documents do not collide.
 */
export interface Stats {
  scope: StatsScope;
  scopeId: string | null;
  period: string;
  countsByStage: Record<string, number>;
  pipelineValue: number;
  wonValue: number;
  wonCount: number;
  lostCount: number;
  activities: number;
  callsBooked: number;
  callsCompleted: number;
  noShows: number;
  byService: Record<string, ServiceStats>;
}
