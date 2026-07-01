/**
 * @module ui/chartRenderer
 * Renders time-series data as a Chart.js chart (bar or line).
 * Handles instance lifecycle — destroys any existing chart before re-render.
 * Uses brand colors from config and BRL formatting in tooltips.
 */
import { BRAND_COLORS } from '../utils/config.js';

export class ChartRenderer {
    /**
     * Render or update a chart with the provided data.
     * Destroys any previous Chart.js instance attached to the same canvas.
     * @param {import('../types.js').DataPoint[]} data - Data points to plot.
     * @param {import('../types.js').ChartType} type - Chart.js chart type.
     * @param {import('../types.js').ChartRendererOptions} options
     * @returns {Chart} New Chart.js instance.
     */
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
