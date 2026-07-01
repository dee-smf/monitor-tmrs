/**
 * @module services/dataService
 * Service responsible for fetching raw time-series data from the server.
 */
export class DataService {
    /**
     * Fetch and parse the time-series JSON file.
     * @param {string} dataPath - Relative or absolute URL to timeSeries.json.
     * @returns {Promise<import('../types.js').RawDataItem[]>} Parsed JSON array.
     * @throws {Error} If the HTTP response is not OK (file not found).
     */
    async load(dataPath) {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error('Arquivo não encontrado');
        return await response.json();
    }
}
