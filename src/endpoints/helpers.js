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
        const state = this.getNflSate();
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
     * Get matchups formatted for display/scoreboard
     * @param {string} leagueId - League ID
     * @param {number} week - Week number
     * @returns {Promise<Array>} Formatted matchup pairs
     */
    async getMatchupScoreboard(leagueId, week) {
        const matchups = await this.getWeeklyMatchups(leagueId, week);
        
        return matchups.map((matchupPair, index) => {
            const [team1, team2] = matchupPair;
            
            return {
                matchup_number: index + 1,
                matchup_id: team1.matchup_id,
                team1: {
                    name: team1.user?.display_name || team1.user?.metadata?.team_name || 'Unknown',
                    points: team1.points_total.toFixed(2),
                    roster_id: team1.roster_id,
                    user: team1.user,
                    starters: team1.starters,
                    players_points: team1.players_points
                },
                team2: team2 ? {
                    name: team2.user?.display_name || team2.user?.metadata?.team_name || 'Unknown',
                    points: team2.points_total.toFixed(2),
                    roster_id: team2.roster_id,
                    user: team2.user,
                    starters: team2.starters,
                    players_points: team2.players_points
                } : null, // Handle bye weeks
                winner: team2 ? (team1.points_total > team2.points_total ? 'team1' : 
                            team2.points_total > team1.points_total ? 'team2' : 'tie') : null
            };
        });
    }

}