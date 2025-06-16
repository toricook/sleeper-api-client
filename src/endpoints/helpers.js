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
                ...enhancedRosters,
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
    }
}