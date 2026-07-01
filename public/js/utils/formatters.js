/**
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatMonthYear(date) {
    const str = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(date);
    return str.charAt(0).toUpperCase() + str.slice(1).replace('.', ''); 
};
