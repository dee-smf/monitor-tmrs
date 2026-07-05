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
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    const labels = dto.rows.map(row => formatDate(row.period));
    const expenses = dto.rows.map(row => row.expenses);
    const revenues = dto.rows.map(row => row.revenues);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Despesas',
            data: expenses,
            borderColor: '#e74c3c',
            tension: 0.1,
          },
          {
            label: 'Receitas',
            data: revenues,
            borderColor: '#2ecc71',
            tension: 0.1,
          },
        ],
      },
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
        scales: {
          x: { title: { display: true, text: 'Período' } },
          y: { title: { display: true, text: 'Valor (R$)' } },
        },
      },
    });
  }
}
