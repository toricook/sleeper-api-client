export const HelperMethods = {

    /**
     * Get a user's ID by their username
     * @param {string} username - Username to search
     * @returns {string} User ID
     */
    async getUserIdByUsername(username)
    {
        const userData = await this.getUser(username);
        return userData['user_id']
    },

    /**
     * Get a user's username by their ID
     * @param {string} username - User ID to search
     * @returns {string} Username
     */
    async getUsernameByUserId(userId)
    {
        const userData = await this.getUserById(userId);
        return userData['username']
    },

    /**
     * Get a user's username by their ID
     * @param {string} leagueId - League ID to search
     * @returns {Object} League information and a list of teams (which includes user info and roster)
     */
    async getLeagueOverview(leagueId)  {
        const [league, users, rosters] = await Promise.all([
            this.getLeague(leagueId),
            this.getUsersByLeague(leagueId),
            this.getRostersByLeague(leagueId)
        ]);

        const enhancedRosters = rosters.map(roster => ({
            ...roster,
            settings: {
              ...roster.settings,
              fpts_total: roster.settings.fpts + (roster.settings.fpts_decimal / 100),
              fpts_against_total: roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100),
              ppts_total: roster.settings.ppts + (roster.settings.ppts_decimal / 100)
            }
          }));

        return {
            league,
            teams: enhancedRosters.map(roster => ({
                user: users.find(user => user.user_id === roster.owner_id),
                ...roster,
            }))
        }
    },

    /**
     * Returns teams in a league sorted by rank
     * @param {string} username - League ID to search
     * @returns {Promise<Array>} An array of teams
     */
    async getLeagueStandings(leagueId) {
        const { teams } = await this.getLeagueOverview(leagueId);
        return teams
        .sort((a, b) => {
          // Sort by wins, then by points for
          if (b.settings.wins !== a.settings.wins) {
            return b.settings.wins - a.settings.wins;
          }
          return b.settings.fpts_total - a.settings.fpts_total;
        })
        .map((team, index) => ({
          rank: index + 1,
          ...team
        }));
    },

    async getCurrentWeek() {
        const state = this.getNflState();
        return state['week'];
    },

    /**
     * Get enhanced weekly matchups with team and user data
     * @param {string} leagueId - League ID
     * @param {number} week - Week number
     * @returns {Promise<Array>} Array of matchup pairs with team details
     */
    async getWeeklyMatchups(leagueId, week) {
        const [matchups, users, rosters] = await Promise.all([
            this.getWeekMatchupsByLeague(leagueId, week),
            this.getUsersByLeague(leagueId),
            this.getRostersByLeague(leagueId)
        ]);
    
        const matchupGroups = matchups.reduce((groups, matchup) => {
            const matchupId = matchup.matchup_id;
            if (!groups[matchupId]) {
                groups[matchupId] = [];
            }
            groups[matchupId].push(matchup);
            return groups;
        }, {});
    
        return Object.values(matchupGroups).map(matchupPair => {
            return matchupPair.map(matchup => {
                const roster = rosters.find(r => r.roster_id === matchup.roster_id);
                const user = users.find(u => u.user_id === roster?.owner_id);
                
                return {
                    ...matchup,
                    roster,
                    user
                    // matchup.points is already the complete decimal value!
                };
            });
        });
    },

    /**
     * Get current week matchups
     * @param {string} leagueId - League ID  
     * @returns {Promise<Array>} Current week matchups
     */
    async getCurrentWeekMatchups(leagueId) {
        const week = await this.getCurrentWeek();
        return this.getWeeklyMatchups(leagueId, week);
    },

/**
 * Get matchups formatted for display/scoreboard with game status
 * @param {string} leagueId - League ID
 * @param {number} week - Week number
 * @returns {Promise<Array>} Formatted matchup pairs with status
 */

async getMatchupScoreboard(leagueId, week) {
    const matchups = await this.getWeeklyMatchups(leagueId, week);
    
    return matchups.map((matchupPair, index) => {
        const [team1, team2] = matchupPair;
        
        return {
            matchup_number: index + 1,
            matchup_id: team1.matchup_id,
            status: 'upcoming', // Temporary static status
            team1: {
                name: team1.user?.metadata?.team_name || team1.user?.display_name || 'Unknown',
                points: (team1.points || 0).toFixed(2),
                roster_id: team1.roster_id,
                user: team1.user,
                starters: team1.starters,
                players_points: team1.players_points
            },
            team2: team2 ? {
                name: team2.user?.metadata?.team_name || team2.user?.display_name || 'Unknown',
                points: (team2.points || 0).toFixed(2),
                roster_id: team2.roster_id,
                user: team2.user,
                starters: team2.starters,
                players_points: team2.players_points
            } : null,
            winner: (team2 && gamesAreComplete) ? 
            (team1.points_total > team2.points_total ? 'team1' : 
             team2.points_total > team1.points_total ? 'team2' : 'tie') : null
        };
    });
},

/**
 * Private helper to determine game status
 * @param {number} week - Week number of the matchup
 * @param {Object} nflState - NFL state object
 * @param {Object} team1 - Team 1 data
 * @param {Object} team2 - Team 2 data
 * @returns {string} Status: 'upcoming', 'in_progress', or 'complete'
 */
_getGameStatus(week, nflState, team1, team2) {
    const currentWeek = nflState.week;
    const currentSeasonType = nflState.season_type;
    
    // If it's not regular season, handle differently
    if (currentSeasonType !== 'regular') {
        return 'upcoming';
    }
    
    // If matchup week is in the future
    if (week > currentWeek) {
        return 'upcoming';
    }
    
    // If matchup week is in the past
    if (week < currentWeek) {
        return 'complete';
    }
    
    // Current week - check if any scoring has started
    const team1Points = team1.points || 0;
    const team2Points = (team2?.points || 0);
    
    // If both teams have zero points, games haven't started yet
    if (team1Points === 0 && team2Points === 0) {
        return 'upcoming';
    }
    
    // If it's Tuesday+ of the current week, games are probably done
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Tuesday (2) or later = games are complete
    if (dayOfWeek >= 2) {
        return 'complete';
    }
    
    // Sunday (0) or Monday (1) with scoring = in progress
    if (team1Points > 0 || team2Points > 0) {
        return 'in_progress';
    }
    
    // Default to upcoming
    return 'upcoming';
},
    /**
     * Get playoff format information for a league
     * @param {string} leagueId - League ID
     * @returns {Promise<Object>} Playoff format details including settings and current season info
     */
    async getPlayoffFormat(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }

        try {
            // Get league settings and NFL state in parallel
            const [league, nflState] = await Promise.all([
                this.getLeague(leagueId),
                this.getNflState()
            ]);

            // Extract playoff settings from league configuration
            const playoffSettings = {
                playoff_teams: league.settings.playoff_teams || 6,
                playoff_weeks: league.settings.playoff_weeks || 3, 
                playoff_start_week: league.settings.playoff_week_start || 15,
                playoff_type: league.settings.playoff_type || 0, // 0 = standard bracket
                total_teams: league.total_rosters || 12
            };

            // Add some derived information
            const playoffInfo = {
                ...playoffSettings,
                regular_season_weeks: (playoffSettings.playoff_start_week - 1),
                championship_week: playoffSettings.playoff_start_week + playoffSettings.playoff_weeks - 1,
                has_wildcard_round: playoffSettings.playoff_teams === 6 && playoffSettings.playoff_weeks === 3,
                teams_with_bye: Math.max(0, playoffSettings.playoff_teams - Math.pow(2, Math.floor(Math.log2(playoffSettings.playoff_teams))))
            };

            return {
                playoffSettings: playoffInfo,
                seasonInfo: nflState,
                league: {
                    name: league.name,
                    season: league.season,
                    total_rosters: league.total_rosters,
                    status: league.status
                }
            };

        } catch (error) {
            throw new Error(`Failed to fetch playoff format: ${error.message}`);
        }
    },

    /**
     * Get detailed playoff bracket structure for visualization
     * @param {string} leagueId - League ID
     * @returns {Promise<Object>} Complete playoff structure with rounds and matchups
     */
    async getPlayoffStructure(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }

        try {
            const formatData = await this.getPlayoffFormat(leagueId);
            const { playoff_teams, playoff_weeks, playoff_start_week } = formatData.playoffSettings;

            // Generate bracket structure based on format
            const structure = this._generateBracketStructure(playoff_teams, playoff_weeks, playoff_start_week);

            return {
                ...formatData,
                bracketStructure: structure
            };

        } catch (error) {
            throw new Error(`Failed to generate playoff structure: ${error.message}`);
        }
    },

    /**
     * Private helper to generate bracket structure
     * @param {number} teams - Number of playoff teams
     * @param {number} weeks - Number of playoff weeks  
     * @param {number} startWeek - Starting week of playoffs
     * @returns {Object} Bracket structure
     */
    _generateBracketStructure(teams, weeks, startWeek) {
        const rounds = [];
        
        if (teams === 6 && weeks === 3) {
            // 6-team format: Wild Card (2 games) -> Semifinals (2 games) -> Championship (1 game)
            rounds.push({
                round: 1,
                week: startWeek,
                name: 'Wild Card',
                games: [
                    { game: 1, team1: '3rd seed', team2: '6th seed' },
                    { game: 2, team1: '4th seed', team2: '5th seed' }
                ]
            });
            
            rounds.push({
                round: 2, 
                week: startWeek + 1,
                name: 'Semifinals',
                games: [
                    { game: 1, team1: '1st seed', team2: '3rd vs 6th winner' },
                    { game: 2, team1: '2nd seed', team2: '4th vs 5th winner' }
                ]
            });
            
            rounds.push({
                round: 3,
                week: startWeek + 2, 
                name: 'Championship',
                games: [
                    { game: 1, team1: 'Semifinal Winner 1', team2: 'Semifinal Winner 2' }
                ]
            });
            
        } else if (teams === 4 && weeks === 2) {
            // 4-team format: Semifinals (2 games) -> Championship (1 game)
            rounds.push({
                round: 1,
                week: startWeek,
                name: 'Semifinals', 
                games: [
                    { game: 1, team1: '1st seed', team2: '4th seed' },
                    { game: 2, team1: '2nd seed', team2: '3rd seed' }
                ]
            });
            
            rounds.push({
                round: 2,
                week: startWeek + 1,
                name: 'Championship',
                games: [
                    { game: 1, team1: 'Semifinal Winner 1', team2: 'Semifinal Winner 2' }
                ]
            });
            
        } else if (teams === 8 && weeks === 3) {
            // 8-team format: Quarterfinals -> Semifinals -> Championship
            rounds.push({
                round: 1,
                week: startWeek,
                name: 'Quarterfinals',
                games: [
                    { game: 1, team1: '1st seed', team2: '8th seed' },
                    { game: 2, team1: '4th seed', team2: '5th seed' },
                    { game: 3, team1: '2nd seed', team2: '7th seed' },
                    { game: 4, team1: '3rd seed', team2: '6th seed' }
                ]
            });
            
            rounds.push({
                round: 2,
                week: startWeek + 1, 
                name: 'Semifinals',
                games: [
                    { game: 1, team1: 'QF Winner 1', team2: 'QF Winner 2' },
                    { game: 2, team1: 'QF Winner 3', team2: 'QF Winner 4' }
                ]
            });
            
            rounds.push({
                round: 3,
                week: startWeek + 2,
                name: 'Championship', 
                games: [
                    { game: 1, team1: 'Semifinal Winner 1', team2: 'Semifinal Winner 2' }
                ]
            });
        }
        
        return {
            format: `${teams}-team, ${weeks}-week`,
            rounds: rounds,
            totalGames: rounds.reduce((sum, round) => sum + round.games.length, 0)
        };
    },

}