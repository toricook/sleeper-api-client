export const PlayerMethods = {
    /**
     * Get all players.
     * NOTE: This is meant to be called at most once per day to keep player IDs updated.
     * You should store these ID to player name mappings on your own server.
     * @returns {Promise<Object>} An array of player information
    */
    async getPlayers() {
        return this._get(`/players/nfl`);
    },

    /**
     * Get list of trending players based on adds/drops.
     * NOTE: Give attribution to Sleeper if using the trending data
     * @param {string} type - The type of trend, either add or drop
     * @param {string} lookback_hours - The number of hours to look back for trends (default = 24)
     * @param {string} limit - The number of results to fetch (default = 25)
     * @returns {Promise<Object>} An array of player information
    */
    async getPlayers(type, lookback_hours = 24, limit = 25) {
        if (!type || !(type == 'add' || type == 'drop'))
        {
            throw new Error('Type (add or drop) is required');
        }
        return this._get(`/players/nfl/trending/${type}?lookback_hours=${lookback_hours}&limit=${limit}`);
    },
}