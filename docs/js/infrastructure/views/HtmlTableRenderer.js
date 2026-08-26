import { formatDate, formatCurrency } from './formatters.js';
import { labelForKey } from './fieldLabels.js';
import { TablePresenter } from '../../adapters/presenters/TablePresenter.js';

const STATUS_BADGE = '<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[12px] font-bold">FECHADO</span>';
const STATUS_BADGE_OPEN = '<span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[12px] font-bold uppercase">ABERTO</span>';

export class HtmlTableRenderer extends TablePresenter {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto) {
    if (dto.rows.length === 0) return;

    const maxPeriod = Math.max(...dto.rows.map(row => row.period));
    const keys = Object.keys(dto.rows[0]);

    const wrapper = document.createElement('div');
    wrapper.className = 'overflow-x-auto border border-outline-variant rounded-lg';

    const table = document.createElement('table');
    table.className = 'w-full text-left font-body-md text-body-md border-collapse';

    const thead = document.createElement('thead');
    thead.className = 'bg-surface-container-low';
    thead.innerHTML = `
      <tr>
        ${keys.map(key => {
          const isNumeric = key !== 'period' && typeof dto.rows[0][key] === 'number';
          const alignClass = isNumeric ? 'text-right' : '';
          return `<th class="px-3 md:px-6 py-4 font-bold border-b border-outline-variant ${alignClass}">${labelForKey(key)}</th>`;
        }).join('')}
        <th data-col="status" class="px-3 md:px-6 py-4 font-bold border-b border-outline-variant">Status</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.innerHTML = dto.rows.map(row => `
      <tr class="hover:bg-surface-container-low border-b border-outline-variant transition-colors">
        ${keys.map(key => {
          const value = row[key];
          const isNumeric = key !== 'period' && typeof value === 'number';
          const alignClass = isNumeric ? 'text-right' : '';
          const fontClass = key === 'period' ? 'font-medium' : '';
          let display;
          if (key === 'period') {
            display = formatDate(value);
          } else if (isNumeric) {
            display = formatCurrency(value);
          } else {
            display = value;
          }
          return `<td class="px-3 md:px-6 py-4 ${fontClass} ${alignClass}">${display}</td>`;
        }).join('')}
        <td data-col="status" class="px-3 md:px-6 py-4">${row.period === maxPeriod ? STATUS_BADGE_OPEN : STATUS_BADGE}</td>
      </tr>
    `).join('');
    table.appendChild(tbody);

    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }
}
