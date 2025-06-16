import { LeagueMethods } from "./leagues.js";
import { UserMethods } from "./users.js"

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

        return {
            league,
            teams: rosters.map(roster => ({
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
          return b.settings.fpts - a.settings.fpts;
        })
        .map((team, index) => ({
          rank: index + 1,
          ...team
        }));
    }
}