export const LeagueMethods = {
    /**
     * Get a league by ID
     * @param {string} leagueId - The league ID to look up
     * @returns {Promise<Object>} League information
    */
    async getLeague(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        return this._get(`/league/${leagueId}`);
    },

    /**
     * Get all rosters by league ID
     * @param {string} leagueId - The league ID to look up
     * @returns {Promise<Object>} An array of roster information
    */
    async getRostersByLeague(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        return this._get(`/league/${leagueId}/rosters`);
    },

    /**
     * Get all users by league ID
     * @param {string} leagueId - The league ID to look up
     * @returns {Promise<Object>} An array of user information
    */
    async getUsersByLeague(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        return this._get(`/league/${leagueId}/users`);
    },

    /**
    * Get all matchups in a league for a given week
    * @param {string} leagueId - The league ID to look up
    * @param {string} week - The week for which to get matchups (e.g. 8)
    * @returns {Promise<Object>} An array of matchup information
    */
    async getWeekMatchupsByLeague(leagueId, week) {
        if (!leagueId || !week) {
            throw new Error('League ID and week are both required');
        }
        return this._get(`/league/${leagueId}/matchups/${week}`);
    },

    /**
     * @typedef {Object} PlayoffBracket
     * @property {number} r - The round for this matchup (1st, 2nd, 3rd round, etc.)
     * @property {number} m - The match ID of the matchup, unique for all matchups within a bracket
     * @property {number|Object} t1 - The roster_id of a team in this matchup OR {w: 1} which means the winner of match id 1
     * @property {number|Object} t2 - The roster_id of the other team in this matchup OR {l: 1} which means the loser of match id 1
     * @property {number} [w] - The roster_id of the winning team, if the match has been played
     * @property {number} [l] - The roster_id of the losing team, if the match has been played
     * @property {Object} [t1_from] - Where t1 comes from, either winner or loser of the match id, necessary to show bracket progression
     * @property {Object} [t2_from] - Where t2 comes from, either winner or loser of the match id, necessary to show bracket progression
     */

    /**
     * Get playoff bracket information for a league
     * @param {string} leagueId - The league ID
     * @returns {Promise<PlayoffBracket[]>} Array of playoff bracket matchups
     */
    async getWinnersPlayoffBracket(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        return this._get(`/league/${leagueId}/winners_bracket`);
    },

    /**
    * Get losers playoff bracket for league
    * @param {string} leagueId - The league ID to look up
    * @returns {Promise<PlayoffBracket[]>} Array of playoff bracket matchups
    */
    async getLosersPlayoffBracket(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        // NOTE: online doc has typo and says this is 'loses_bracket' but it is not
        return this._get(`/league/${leagueId}/losers_bracket`);
    },

    /**
    * Get transactions for league by week
    * @param {string} leagueId - The league ID to look up
    * @param {string} week - The week for which to get transactions
    * @returns {Promise<Object>} An array of transaction information
    */
    async getWeekTransactionsByLeague(leagueId, week) {
        if (!leagueId || !week) {
            throw new Error('League ID and week are both required');
        }
        return this._get(`/league/${leagueId}/transactions/${week}`);
    },

    /**
    * Get traded picks for league, including future picks
    * @param {string} leagueId - The league ID to look up
    * @returns {Promise<Object>} An array of traded pick information
    */
    async getTradedPicksByLeague(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
        }
        return this._get(`/league/${leagueId}/traded_picks`);
    },

    /**
    * Get all drafts for a league (most will only have 1)
    * @param {string} leagueId - The league ID to look up
    * @returns {Promise<Object>} Draft information
    */
    async getDraftsByLeague(leagueId) {
        if (!leagueId) {
            throw new Error('League ID is required');
            }
        return this._get(`/league/${leagueId}/drafts`);
    }
}