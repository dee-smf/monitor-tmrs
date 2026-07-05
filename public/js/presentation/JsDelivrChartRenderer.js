import { ChartRenderer } from '../domain/ChartRenderer.js';
import { formatDate, formatCurrency } from './formatters.js';
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

Chart.register(...registerables);

export class JsDelivrChartRenderer extends ChartRenderer {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto) {
    if (dto.rows.length === 0) return;

    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    const keys = Object.keys(dto.rows[0]);
    const numericKeys = keys.filter(key => key !== 'period' && typeof dto.rows[0][key] === 'number');
    const labels = dto.rows.map(row => formatDate(row.period));

    const palette = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];

    const datasets = numericKeys.map((key, i) => ({
      label: key,
      data: dto.rows.map(row => row[key]),
      borderColor: palette[i % palette.length],
      tension: 0.1,
    }));

    new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              },
            },
          },
        },
      },
    });
  }
}
