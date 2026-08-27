import { ChartPresenter } from '../../adapters/presenters/ChartPresenter.js';
import { formatDate, formatCurrency } from './formatters.js';
import { labelForKey } from './fieldLabels.js';
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

Chart.register(...registerables);

export class JsDelivrChartRenderer extends ChartPresenter {
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
    const barKeys = new Set(['expenses', 'revenues']);

    const datasets = numericKeys.map((key, i) => {
      const color = palette[i % palette.length];
      const isBar = barKeys.has(key);

      return {
        label: labelForKey(key),
        data: dto.rows.map(row => row[key]),
        borderColor: color,
        backgroundColor: isBar ? color : 'transparent',
        type: isBar ? 'bar' : 'line',
        tension: 0.1,
        fill: false,
        ...(isBar && { categoryPercentage: 0.6, barPercentage: 0.8 }),
        ...(!isBar && { order: -1 }),
      };
    });

    new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Período' },
          },
          y: {
            title: { display: true, text: 'Valor (R$)' },
            ticks: {
              callback(value) {
                return formatCurrency(value);
              },
            },
          },
        },
      },
    });
  }
}
