export async function loadData(data_path, callback) {
    const response = await fetch(data_path);
    if (!response.ok) throw new Error('Arquivo não encontrado');
    const data = await response.json();
    callback(data);
};
