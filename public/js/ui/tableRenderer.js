/**
 * @module ui/tableRenderer
 * Renders time-series data as an HTML table.
 * Each row displays label, revenues, expenses, and result with
 * conditional coloring (green for positive result, red for negative).
 */
export class TableRenderer {
    /**
     * Populate the table body with data rows.
     * Data is reversed to show most recent period first.
     * @param {import('../types.js').DataPoint[]} data - Data points to render.
     * @param {import('../types.js').TableRendererOptions} options
     */
    render(data, { formatCurrency, containerId = 'tableBody' }) {
        const tbody = document.getElementById(containerId);
        tbody.innerHTML = '';

        const tableData = [...data].reverse();

        if (tableData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="table__empty">Nenhum dado encontrado para este período.</td></tr>`;
            return;
        }

        tableData.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'table__row';
            const resultModifier = row.result >= 0 ? 'table__cell--positive' : 'table__cell--negative';

            tr.innerHTML = `
                <td class="table__cell table__cell--label">${row.label}</td>
                <td class="table__cell table__cell--number">${formatCurrency(row.revenues)}</td>
                <td class="table__cell table__cell--number">${formatCurrency(row.expenses)}</td>
                <td class="table__cell ${resultModifier}">${formatCurrency(row.result)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}
