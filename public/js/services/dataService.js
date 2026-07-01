export class DataService {
    async load(dataPath) {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error('Arquivo não encontrado');
        return await response.json();
    }
}
