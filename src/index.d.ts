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
      fpts_total: number;
      fpts_against_total: number;
    };
  }

  export interface SleeperDraft {
    draft_id: string;
    league_id: string;
    status: 'pre_draft' | 'drafting' | 'complete';
    type: 'snake' | 'linear' | 'auction';
    settings: {
      teams: number;
      rounds: number;
      pick_timer: number;
    };
    season: string;
    season_type: string;
    start_time: number;
  }
  
  export interface SleeperDraftPick {
    pick_no: number;
    player_id: string;
    picked_by: string;
    roster_id: number;
    round: number;
    draft_slot: number;
    draft_id: string;
    metadata?: {
      team?: string;
      position?: string;
      first_name?: string;
      last_name?: string;
    };
  }
  
  export interface SleeperPlayer {
    player_id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    position: string;
    team: string | null;
    age: number;
    height: string;
    weight: string;
    college: string;
    years_exp: number;
    status: 'Active' | 'Inactive' | 'Injured' | 'PUP' | 'Suspended';
    fantasy_positions: string[];
  }
  
  export interface SleeperTransaction {
    transaction_id: string;
    type: 'trade' | 'waiver' | 'free_agent';
    status: 'complete' | 'pending';
    creator: string;
    roster_ids: number[];
    adds?: Record<string, number>; // player_id -> roster_id
    drops?: Record<string, number>; // player_id -> roster_id
    draft_picks?: any[];
    waiver_budget?: any[];
    created: number;
    status_updated: number;
    settings?: any;
    metadata?: any;
  }
  
  export interface SleeperPlayoffBracket {
    r: number; // round
    m: number; // match id
    t1: number | { w: number } | { l: number }; // team 1 (roster_id or reference)
    t2: number | { w: number } | { l: number }; // team 2 (roster_id or reference)
    w?: number; // winner roster_id
    l?: number; // loser roster_id
    t1_from?: { w: number } | { l: number }; // where t1 comes from
    t2_from?: { w: number } | { l: number }; // where t2 comes from
  }
  
  export interface SleeperTrendingPlayer {
    player_id: string;
    count: number;
  }
  
  export interface SleeperNFLState {
    week: number;
    season: string;
    season_type: 'regular' | 'post';
    display_week: number;
    leg: number;
    season_start_date: string;
    previous_season: string;
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
  
  export interface EnhancedMatchup extends SleeperMatchup {
    roster: SleeperRoster;
    user: SleeperUser | null;
  }
  
  export interface MatchupPair extends Array<EnhancedMatchup> {
    0: EnhancedMatchup;
    1?: EnhancedMatchup; // Optional for bye weeks
  }
  
export interface ScoreboardMatchup {
  matchup_number: number;
  matchup_id: number;
  status: 'upcoming' | 'in_progress' | 'complete'; // Add this line
  team1: {
    name: string;
    points: string;
    roster_id: number;
    user: SleeperUser | null;
    starters: string[];
    players_points: Record<string, number>;
  };
  team2: {
    name: string;
    points: string;
    roster_id: number;
    user: SleeperUser | null;
    starters: string[];
    players_points: Record<string, number>;
  } | null;
  winner: 'team1' | 'team2' | 'tie' | null;
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
    getDraftsByUser(userId: string, season: string): Promise<SleeperDraft[]>;
  
    // League methods
    getLeague(leagueId: string): Promise<SleeperLeague>;
    getRostersByLeague(leagueId: string): Promise<SleeperRoster[]>;
    getUsersByLeague(leagueId: string): Promise<SleeperUser[]>;
    getWeekMatchupsByLeague(leagueId: string, week: string): Promise<SleeperMatchup[]>;
    getWinnersPlayoffBracket(leagueId: string): Promise<SleeperPlayoffBracket[]>;
    getLosersPlayoffBracket(leagueId: string): Promise<SleeperPlayoffBracket[]>;
    getWeekTransactionsByLeague(leagueId: string, week: string): Promise<SleeperTransaction[]>;
    getTradedPicksByLeague(leagueId: string): Promise<any[]>; // TODO: add type
    getDraftsByLeague(leagueId: string): Promise<SleeperDraft[]>;
  
    // Draft methods
    getDraft(draftId: string): Promise<SleeperDraft>;
    getPicksByDraft(draftId: string): Promise<SleeperDraftPick[]>;
    getTradedPicksByDraft(draftId: string): Promise<any[]>; // TODO: add type
  
    // Player methods
    getPlayers(): Promise<Record<string, SleeperPlayer>>;
    getTrendingPlayers(type: 'add' | 'drop', lookback_hours?: number, limit?: number): Promise<SleeperTrendingPlayer[]>;
  
    // Helper methods
    getUserIdByUsername(username: string): Promise<string>;
    getUsernameByUserId(userId: string): Promise<string>;
    getLeagueOverview(leagueId: string): Promise<LeagueOverview>;
    getLeagueStandings(leagueId: string): Promise<StandingTeam[]>;
    getCurrentWeek() : Promise<number>;
    getWeeklyMatchups(leagueId: string, week: number): Promise<MatchupPair[]>;
    getCurrentWeekMatchups(leagueId: string): Promise<MatchupPair[]>;
    getMatchupScoreboard(leagueId: string, week: number): Promise<ScoreboardMatchup[]>;
  }