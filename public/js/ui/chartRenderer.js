import { BRAND_COLORS } from '../utils/config.js';

export class ChartRenderer {
    render(data, type, { chartInstance, formatCurrency, canvasId = 'mainChart' }) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        const labels = data.map(d => d.label);
        const revData = data.map(d => d.revenues);
        const expData = data.map(d => d.expenses);
        const resData = data.map(d => d.result);

        if (chartInstance) {
            chartInstance.destroy();
        }

        const isLine = type === 'line';

        const datasets = [
            {
                label: 'Arrecadação',
                data: revData,
                backgroundColor: BRAND_COLORS.REVENUE,
                borderColor: BRAND_COLORS.REVENUE_BORDER,
                borderWidth: isLine ? 2 : 1,
                pointRadius: isLine ? 4 : 0,
                tension: 0.3
            },
            {
                label: 'Despesas',
                data: expData,
                backgroundColor: BRAND_COLORS.EXPENSE,
                borderColor: BRAND_COLORS.EXPENSE_BORDER,
                borderWidth: isLine ? 2 : 1,
                pointRadius: isLine ? 4 : 0,
                tension: 0.3
            },
            {
                label: 'Resultado',
                data: resData,
                backgroundColor: BRAND_COLORS.RESULT,
                borderColor: BRAND_COLORS.RESULT_BORDER,
                borderWidth: isLine ? 2 : 1,
                pointRadius: isLine ? 4 : 0,
                tension: 0.3,
                type: 'line'
            }
        ];

        return new Chart(ctx, {
            type: type,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
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
}

const _chartRenderer = new ChartRenderer();

export function renderChart(data, type, opts) {
    return _chartRenderer.render(data, type, opts);
}
