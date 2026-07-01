/**
 * Renders (or re-renders) a Chart.js chart on the given canvas. Destroys any
 * previous instance to prevent animation/tooltip bugs on mode switch.
 * @param {Object[]} data - Array of { label, revenues, expenses, result }.
 * @param {'bar'|'line'} type - Chart type: 'bar' for monthly, 'line' for rolling/ytd.
 * @param {Object} opts
 * @param {Object|null} opts.chartInstance - Previous Chart.js instance (or null).
 * @param {(value: number) => string} opts.formatCurrency - Formatter for tooltip labels.
 * @param {string} [opts.canvasId='mainChart'] - DOM id of the canvas element.
 * @returns {Object|null} The new Chart.js instance.
 */
export function renderChart(data, type, { chartInstance, formatCurrency, canvasId = 'mainChart' }) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
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

    return new Chart(ctx, {
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
};
