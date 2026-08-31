import { formatDate, formatCurrency } from './formatters.js';
import { labelForKey } from './fieldLabels.js';
import { TablePresenter } from '../../adapters/presenters/TablePresenter.js';

const COLUMN_ORDER_DEFAULT = ['period', 'revenues', 'expenses', 'result'];
const COLUMN_ORDER_DETAIL = ['period', 'revenues', 'collection', 'landfill', 'result'];

const STYLES = {
    wrapper: 'overflow-x-auto border border-outline-variant rounded-lg',
    table: 'w-full text-left font-body-md text-body-md border-collapse',
    thead: 'bg-surface-container-low',
    th: 'px-2 md:px-4 py-4 text-xs font-bold border-b border-outline-variant',
    thNumeric: 'text-right',
    thNowrap: 'whitespace-nowrap',
    thStatus: 'px-2 md:px-4 py-4 text-xs font-bold border-b border-outline-variant text-right',
    tr: 'hover:bg-surface-container-low border-b border-outline-variant transition-colors',
    td: 'px-2 md:px-4 py-4 text-xs',
    tdPeriod: 'font-medium',
    tdNumeric: 'text-right',
    tdNowrap: 'whitespace-nowrap',
    tdResultNegative: 'text-secondary',
    tdResultPositive: 'text-primary',
    statusBadge: 'bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold',
    statusBadgeOpen: 'bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold uppercase',
};

export class HtmlTableRenderer extends TablePresenter {
  constructor(containerSelector) {
    super();
    this.container = document.querySelector(containerSelector);
  }

  render(dto, detailExpenses = false, maxPeriod = null) {
    if (dto.rows.length === 0) return;

    if (maxPeriod === null) {
      maxPeriod = Math.max(...dto.rows.map(row => row.period));
    }
    const columnOrder = detailExpenses ? COLUMN_ORDER_DETAIL : COLUMN_ORDER_DEFAULT;
    const allKeys = Object.keys(dto.rows[0]);
    const ordered = columnOrder.filter(k => allKeys.includes(k));
    const remaining = allKeys.filter(k => !columnOrder.includes(k));
    const keys = [...ordered, ...remaining];

    const wrapper = document.createElement('div');
    wrapper.className = STYLES.wrapper;

    const table = document.createElement('table');
    table.className = STYLES.table;

    const thead = document.createElement('thead');
    thead.className = STYLES.thead;
    thead.innerHTML = `
      <tr>
        ${keys.map(key => {
          const isNumeric = key !== 'period' && typeof dto.rows[0][key] === 'number';
          const alignClass = isNumeric ? STYLES.tdNumeric : '';
          const nowrapClass = isNumeric ? STYLES.tdNowrap : '';
          return `<th class="${STYLES.th} ${alignClass} ${nowrapClass}">${labelForKey(key)}</th>`;
        }).join('')}
        <th data-col="status" class="${STYLES.thStatus}">Status</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.innerHTML = dto.rows.map(row => `
      <tr class="${STYLES.tr}">
        ${keys.map(key => {
          const value = row[key];
          const isNumeric = key !== 'period' && typeof value === 'number';
          const alignClass = isNumeric ? STYLES.tdNumeric : '';
          const fontClass = key === 'period' ? STYLES.tdPeriod : '';
          const nowrapClass = isNumeric ? STYLES.tdNowrap : '';
          const colorClass = key === 'result' ? (value < 0 ? STYLES.tdResultNegative : STYLES.tdResultPositive) : '';
          let display;
          if (key === 'period') {
            display = formatDate(value);
          } else if (isNumeric) {
            display = formatCurrency(value);
          } else {
            display = value;
          }
          return `<td class="${STYLES.td} ${fontClass} ${alignClass} ${nowrapClass} ${colorClass}">${display}</td>`;
        }).join('')}
        <td data-col="status" class="${STYLES.td} ${STYLES.tdNumeric}">${row.period === maxPeriod ? `<span class="${STYLES.statusBadgeOpen}">ABERTO</span>` : `<span class="${STYLES.statusBadge}">FECHADO</span>`}</td>
      </tr>
    `).join('');
    table.appendChild(tbody);

    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }
}
