import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { loadData } from './services/dataService.js';
import { processData } from './services/dataProcessor.js';
import { setupYearSelector } from './ui/yearSelector.js';

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

            renderChart(displayData, chartType);
            renderTable(displayData);
        }

        function renderChart(data, type) {
            const ctx = document.getElementById('mainChart').getContext('2d');
            
            const labels = data.map(d => d.label);
            const revData = data.map(d => d.revenues);
            const expData = data.map(d => d.expenses);
            const resData = data.map(d => d.result);

            // Destruir gráfico anterior para evitar bugs de troca de tipo e animação
            if (chartInstance) {
                chartInstance.destroy();
            }

            // Cores padrão
            const colorRev = 'rgba(34, 197, 94, 0.8)'; // green-500
            const colorExp = 'rgba(239, 68, 68, 0.8)'; // red-500
            const colorRes = 'rgba(59, 130, 246, 0.8)'; // blue-500

            const datasets = [
                {
                    label: 'Arrecadação',
                    data: revData,
                    backgroundColor: colorRev,
                    borderColor: 'rgb(21, 128, 61)',
                    borderWidth: type === 'line' ? 2 : 1,
                    pointRadius: type === 'line' ? 4 : 0,
                    tension: 0.3
                },
                {
                    label: 'Despesas',
                    data: expData,
                    backgroundColor: colorExp,
                    borderColor: 'rgb(185, 28, 28)',
                    borderWidth: type === 'line' ? 2 : 1,
                    pointRadius: type === 'line' ? 4 : 0,
                    tension: 0.3
                },
                {
                    label: 'Resultado',
                    data: resData,
                    backgroundColor: colorRes,
                    borderColor: 'rgb(29, 78, 216)',
                    borderWidth: type === 'line' ? 2 : 1,
                    pointRadius: type === 'line' ? 4 : 0,
                    tension: 0.3,
                    type: type === 'bar' ? 'line' : 'line' // Resultado sempre fica legal como linha mesmo num gráfico de barras
                }
            ];

            chartInstance = new Chart(ctx, {
                type: type,
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 }).format(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        function renderTable(data) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            // Mostrar na tabela do mais recente para o mais antigo, geralmente melhor para leitura
            const tableData = [...data].reverse();

            if(tableData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhum dado encontrado para este período.</td></tr>`;
                return;
            }

            tableData.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 transition-colors';
                
                // Formatação condicional para o resultado (verde se positivo, vermelho se negativo)
                const resultColor = row.result >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';

                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${row.label}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-gray-700">${formatCurrency(row.revenues)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-gray-700">${formatCurrency(row.expenses)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${resultColor}">${formatCurrency(row.result)}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // --- 4. Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('viewMode').addEventListener('change', updateView);
            document.getElementById('yearSelector').addEventListener('change', updateView);
            
            // Inicia o app
            const TIME_SERIES = 'data/timeSeries.json';
            loadData(TIME_SERIES, handleDataLoaded);
        });
