export const UserMethods = {
    /**
     * Get user information by username
     * @param {string} username - The username to look up
     * @returns {Promise<Object>} User information
    */
    async getUser(username) {
        if (!username) {
            throw new Error('Username is required');
        }
        return this._get(`/user/${username}`);
    },

    /**
     * Get user information by user ID
     * @param {string} userId - The user ID to look up
     * @returns {Promise<Object>} User information
    */
    async getUserById(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return this._get(`/user/${userId}`);
    },

    /**
     * Get all leagues for a specific user
     * @param {string} userId - The user ID for which to look up leagues
     * @param {string} season  - The season for which to look up leagues (e.g. 2017)
     * @returns {Promise<Object>} An array of league information
    */
    async getLeaguesForUser(userId, season) {
        if (!userId || !season) {
            throw new Error('User ID and season are both required');
        }
        // NOTE: only 'nfl' currently supported as the sport
        return this._get(`/user/${userId}/leagues/nfl/${season}`);
    },

    /**
    * Get all drafts for a user
    * @param {string} userId - The user ID to look up
    * @param {string} season - The season for which to look up drafts (e.g. 2017)
    * @returns {Promise<Object>} An array of draft information
    */
        async getDraftsByUser(userId, season) {
            if (!userId || !season) {
                throw new Error('League ID and season are both required');
              }
            return this._get(`/user/${userId}/drafts/nfl/${season}`);
        }
    
}