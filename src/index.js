import { UserMethods } from "./endpoints/users.js"; 
import { LeagueMethods } from "./endpoints/leagues.js";
import { DraftMethods } from "./endpoints/drafts.js";
import { PlayerMethods } from "./endpoints/players.js";
import { HelperMethods } from "./endpoints/helpers.js";

class SleeperAPI {
    constructor(options = {}) {
        this.baseURL = 'https://api.sleeper.app/v1';
        this.timeout = options.timeout || 10000; // 10 second default
    }

    /**
     * Core HTTP GET method with error handling
     * @param {string} endpoint - API endpoint (e.g., '/league/123456789')
     * @param {Object} options - Additional fetch options
     * @returns {Promise} - Parsed JSON response
     */
    async _get(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'sleeper-api-client/1.0.0',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Resource not found: ${endpoint}`);
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status >= 500) {
                    throw new Error(`Sleeper server error (${response.status}). Please try again later.`);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error - please check your connection');
            } else if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON response from Sleeper API');
            } else {
                throw error;
            }
        }
    }

    /**
    * Get the current state of the NFL season
    */
    async getNflState() {
        return this._get(`/state/nfl`);
    }
}

Object.assign(SleeperAPI.prototype, UserMethods);
Object.assign(SleeperAPI.prototype, LeagueMethods);
Object.assign(SleeperAPI.prototype, DraftMethods);
Object.assign(SleeperAPI.prototype, PlayerMethods);
Object.assign(SleeperAPI.prototype, HelperMethods);

export default SleeperAPI;

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SleeperAPI;
}
