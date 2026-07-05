import { formatDate, formatCurrency } from './formatters.js';
import { TableRenderer } from '../domain/TableRenderer.js';

export class HtmlTableRenderer extends TableRenderer {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto) {
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
