import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { loadData } from './services/dataService.js';
import { processData } from './services/dataProcessor.js';
import { setupYearSelector } from './ui/yearSelector.js';
import { renderChart } from './ui/chartRenderer.js';
import { renderTable } from './ui/tableRenderer.js';

        // --- 1. Dados e Configurações Iniciais ---
        
        let rawData = [];
        let processedData = {
            simple: [],
            rolling12: [],
            ytd: []
        };
        let availableYears = [];
        let chartInstance = null;

        // Formatações


        // --- 2. Busca e Processamento de Dados ---
        
        function handleDataLoaded(data) {
            rawData = data;
            const result = processData(rawData, formatMonthYear);
            processedData = result.processedData;
            availableYears = result.availableYears;
            
            setupYearSelector(availableYears);
            updateView();
        }

        // --- 3. Renderização (Gráficos e Tabela) ---

        function updateView() {
            const mode = document.getElementById('viewMode').value;
            const yearSelectorContainer = document.getElementById('yearSelectorContainer');
            const selectedYear = parseInt(document.getElementById('yearSelector').value, 10);
            
            let displayData = [];
            let chartType = 'bar'; // default
            
            // Lógica de visualização
            if (mode === 'simple') {
                yearSelectorContainer.classList.add('hidden');
                displayData = processedData.simple;
                chartType = 'bar';
                document.getElementById('chartTitle').innerText = 'Arrecadação e Despesas Mensais';
                document.getElementById('tableTitle').innerText = 'Extrato Mensal';
            } 
            else if (mode === 'rolling12') {
                yearSelectorContainer.classList.add('hidden');
                displayData = processedData.rolling12;
                chartType = 'line';
                document.getElementById('chartTitle').innerText = 'Acumulado (Últimos 12 Meses)';
                document.getElementById('tableTitle').innerText = 'Extrato Acumulado (12m)';
            } 
            else if (mode === 'ytd') {
                yearSelectorContainer.classList.remove('hidden');
                displayData = processedData.ytd.filter(d => d.year === selectedYear);
                chartType = 'line';
                document.getElementById('chartTitle').innerText = `Acumulado no Exercício (${selectedYear})`;
                document.getElementById('tableTitle').innerText = `Extrato do Exercício (${selectedYear})`;
            }

            chartInstance = renderChart(displayData, chartType, { chartInstance, formatCurrency });
            renderTable(displayData, { formatCurrency });
        }

        // --- 4. Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('viewMode').addEventListener('change', updateView);
            document.getElementById('yearSelector').addEventListener('change', updateView);
            
            // Inicia o app
            const TIME_SERIES = 'data/timeSeries.json';
            loadData(TIME_SERIES, handleDataLoaded);
        });
