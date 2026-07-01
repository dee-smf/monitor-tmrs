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
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhum dado encontrado para este período.</td></tr>`;
            return;
        }

        tableData.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            const resultColor = row.result >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${row.label}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-gray-700">${formatCurrency(row.revenues)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-gray-700">${formatCurrency(row.expenses)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right ${resultColor}">${formatCurrency(row.result)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}
