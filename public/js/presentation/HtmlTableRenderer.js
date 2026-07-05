import { formatDate, formatCurrency } from './formatters.js';
import { TableRenderer } from '../domain/TableRenderer.js';

export class HtmlTableRenderer extends TableRenderer {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto) {
    if (dto.rows.length === 0) return;

    const keys = Object.keys(dto.rows[0]);

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          ${keys.map(key => `<th>${key}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${dto.rows.map(row => `
          <tr>
            ${keys.map(key => {
              const value = row[key];
              let display;
              if (key === 'period') {
                display = formatDate(value);
              } else if (typeof value === 'number') {
                display = formatCurrency(value);
              } else {
                display = value;
              }
              return `<td>${display}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    `;

    this.container.appendChild(table);
  }
}
