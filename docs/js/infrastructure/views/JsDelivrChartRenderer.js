import { ChartPresenter } from '../../adapters/presenters/ChartPresenter.js';
import { formatDate, formatCurrency, formatMillions } from './formatters.js';
import { labelForKey } from './fieldLabels.js';
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

Chart.register(...registerables);

export class JsDelivrChartRenderer extends ChartPresenter {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto, detailExpenses = false) {
    if (dto.rows.length === 0) return;

    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    const keys = Object.keys(dto.rows[0]);
    const numericKeys = keys.filter(key => key !== 'period' && typeof dto.rows[0][key] === 'number');
    const labels = dto.rows.map(row => formatDate(row.period));

    const palette = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];

    let datasets;
    let stacked = false;

    if (detailExpenses) {
      stacked = true;
      const colorMap = { revenues: '#2ecc71', collection: '#e74c3c', landfill: '#c0392b', result: '#3498db' };
      const barKeys = new Set(['revenues', 'collection', 'landfill']);
      const stackMap = { revenues: 'revenues', collection: 'expenses', landfill: 'expenses' };

      datasets = numericKeys.map((key) => {
        const color = colorMap[key] || palette[0];
        const isBar = barKeys.has(key);

        return {
          label: labelForKey(key),
          data: dto.rows.map(row => row[key]),
          borderColor: color,
          backgroundColor: isBar ? color + 'cc' : 'transparent',
          type: isBar ? 'bar' : 'line',
          tension: 0.1,
          fill: false,
          ...(isBar && { stack: stackMap[key], categoryPercentage: 0.6, barPercentage: 0.8 }),
          ...(!isBar && { order: -1 }),
        };
      });
    } else {
      const colorMap = { revenues: '#2ecc71', expenses: '#e74c3c', result: '#3498db' };
      const barKeys = new Set(['expenses', 'revenues']);

      datasets = numericKeys.map((key, i) => {
        const color = colorMap[key] || palette[i % palette.length];
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
    }

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
            ...(stacked && { stacked: true }),
          },
          y: {
            title: { display: true, text: 'Valor (em R$ milhões)' },
            ticks: {
              callback(value) {
                return formatMillions(value);
              },
            },
            ...(stacked && { stacked: true }),
          },
        },
      },
    });
  }
}
