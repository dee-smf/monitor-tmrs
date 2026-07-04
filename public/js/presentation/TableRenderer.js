import { formatDate, formatCurrency } from './formatters.js';

export class TableRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
  }

  render(dto) {
    this.container.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Período</th>
          <th>Despesas</th>
          <th>Receitas</th>
        </tr>
      </thead>
      <tbody>
        ${dto.rows.map(row => `
          <tr>
            <td>${formatDate(row.period)}</td>
            <td>${formatCurrency(row.expenses)}</td>
            <td>${formatCurrency(row.revenues)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    this.container.appendChild(table);
  }
}
