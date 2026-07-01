/**
 * Fetches time-series data from a JSON endpoint and passes the result to a callback.
 * @param {string} data_path - Relative or absolute URL to the JSON file.
 * @param {(data: Object[]) => void} callback - Called with the parsed JSON array.
 * @returns {Promise<void>}
 */
export async function loadData(data_path, callback) {
    const response = await fetch(data_path);
    if (!response.ok) throw new Error('Arquivo não encontrado');
    const data = await response.json();
    callback(data);
};
