export class DataService {
    async load(dataPath) {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error('Arquivo não encontrado');
        return await response.json();
    }
}

const _dataService = new DataService();

export async function loadData(dataPath, callback) {
    const data = await _dataService.load(dataPath);
    callback(data);
}
