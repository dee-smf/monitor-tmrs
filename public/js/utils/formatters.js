/**
 * @module formatters
 * Formatting utilities for currency and date values.
 */

/**
 * @type {import('../types.js').FormatCurrencyFn}
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

/**
 * @type {import('../types.js').FormatMonthYearFn}
 */
export function formatMonthYear(date) {
    const str = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(date);
    return str.charAt(0).toUpperCase() + str.slice(1).replace('.', ''); 
};
