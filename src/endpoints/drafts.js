export const DraftMethods = {
    /**
    * Get draft by ID
    * @param {string} draftId - The draft ID to look up
    * @returns {Promise<Object>} Draft information
    */
    async getDraft(draftId) {
        if (!draftId) {
            throw new Error('Draft ID is required');
            }
        return this._get(`/draft/${draftId}`);
    },

    /**
    * Get all picks in a draft
    * @param {string} draftId - The draft ID to look up
    * @returns {Promise<Object>} An array of draft picks
    */
       async getPicksByDraft(draftId) {
        if (!draftId) {
            throw new Error('Draft ID is required');
            }
        return this._get(`/draft/${draftId}/picks`);
    },

     /**
    * Get all traded picks in a draft
    * @param {string} draftId - The draft ID to look up
    * @returns {Promise<Object>} An array of traded draft picks
    */
     async getTradedPicksByDraft(draftId) {
        if (!draftId) {
            throw new Error('Draft ID is required');
            }
        return this._get(`/draft/${draftId}/traded_picks`);
    },

}