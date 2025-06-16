// src/index.d.ts
export interface SleeperUser {
    user_id: string;
    username: string;
    display_name: string;
    avatar: string | null;
    metadata?: {
      team_name?: string;
    };
  }
  
  export interface SleeperLeague {
    league_id: string;
    name: string;
    season: string;
    season_type: string;
    total_rosters: number;
    status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
    sport: string;
    settings: Record<string, any>;
    scoring_settings: Record<string, number>;
    roster_positions: string[];
  }
  
  export interface SleeperRoster {
    roster_id: number;
    owner_id: string;
    players: string[];
    starters: string[];
    reserve?: string[];
    taxi?: string[];
    settings: {
      wins: number;
      losses: number;
      ties: number;
      fpt_total: number;
      fpts_against_total: number;
    };
  }
  
  export interface LeagueOverview {
    league: SleeperLeague;
    users: SleeperUser[];
    rosters: SleeperRoster[];
    teams: Array<SleeperRoster & { user: SleeperUser; rank?: number }>;
  }
  
  export interface StandingTeam extends SleeperRoster {
    rank: number;
    user: SleeperUser | null;
  }
  
  export interface SleeperMatchup {
    roster_id: number;
    matchup_id: number;
    points: number;
    players: string[];
    starters: string[];
    players_points: Record<string, number>;
    starters_points: Record<string, number>;
  }
  
  export interface SleeperAPIOptions {
    timeout?: number;
  }
  
  export default class SleeperAPI {
    constructor(options?: SleeperAPIOptions);
  
    // Core method
    getNflState(): Promise<any>;
  
    // User methods
    getUser(username: string): Promise<SleeperUser>;
    getUserById(userId: string): Promise<SleeperUser>;
    getLeaguesForUser(userId: string, season: string): Promise<SleeperLeague[]>;
    getDraftsByUser(userId: string, season: string): Promise<any[]>;
  
    // League methods
    getLeague(leagueId: string): Promise<SleeperLeague>;
    getRostersByLeague(leagueId: string): Promise<SleeperRoster[]>;
    getUsersByLeague(leagueId: string): Promise<SleeperUser[]>;
    getWeekMatchupsByLeague(leagueId: string, week: string): Promise<any[]>;
    getWinnersPlayoffBracket(leagueId: string): Promise<any[]>;
    getLosersPlayoffBracket(leagueId: string): Promise<any[]>;
    getWeekTransactionsByLeague(leagueId: string, week: string): Promise<any[]>;
    getTradedPicksByLeague(leagueId: string): Promise<any[]>;
    getDraftsByLeague(leagueId: string): Promise<any[]>;
  
    // Draft methods
    getDraft(draftId: string): Promise<any>;
    getPicksByDraft(draftId: string): Promise<any[]>;
    getTradedPicksByDraft(draftId: string): Promise<any[]>;
  
    // Player methods
    getPlayers(): Promise<Record<string, any>>;
    getTrendingPlayers(type: 'add' | 'drop', lookback_hours?: number, limit?: number): Promise<any[]>;
  
    // Helper methods
    getUserIdByUsername(username: string): Promise<string>;
    getUsernameByUserId(userId: string): Promise<string>;
    getLeagueOverview(leagueId: string): Promise<LeagueOverview>;
    getLeagueStandings(leagueId: string): Promise<StandingTeam[]>;
  }