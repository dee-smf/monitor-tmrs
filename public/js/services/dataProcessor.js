/**
 * @module services/dataProcessor
 * Transform raw time-series data into the three view-mode data sets
 * (simple, rolling12, ytd). All calculation logic is centralized here.
 */
export class DataProcessor {
    /**
     * Process raw period data into three view-mode representations.
     * Sorts input chronologically, computes rolling sums and year-to-date
     * accumulators, and extracts available years.
     * @param {import('../types.js').RawDataItem[]} rawData - Unsorted raw items from the JSON file.
     * @param {import('../types.js').FormatMonthYearFn} formatMonthYear - Date formatter for labels.
     * @returns {import('../types.js').ProcessResult} Processed data sets + available years.
     */
    process(rawData, formatMonthYear) {
        const processedData = { simple: [], rolling12: [], ytd: [] };
        const sortedData = [...rawData].sort((a, b) => a.period - b.period);
        const yearsSet = new Set();

        processedData.simple = sortedData.map(item => {
            const date = new Date(item.period);
            yearsSet.add(date.getFullYear());
            return {
                date: date,
                label: formatMonthYear(date),
                year: date.getFullYear(),
                revenues: item.revenues,
                expenses: item.expenses,
                result: item.revenues - item.expenses
            };
        });

        const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

        processedData.rolling12 = processedData.simple.map((current, index, arr) => {
            const startIndex = Math.max(0, index - 11);
            const window = arr.slice(startIndex, index + 1);
            const sumRevenues = window.reduce((sum, val) => sum + val.revenues, 0);
            const sumExpenses = window.reduce((sum, val) => sum + val.expenses, 0);

            return {
                date: current.date,
                label: current.label,
                revenues: sumRevenues,
                expenses: sumExpenses,
                result: sumRevenues - sumExpenses
            };
        });

        let currentYear = null;
        let accRevenues = 0;
        let accExpenses = 0;

        processedData.ytd = processedData.simple.map(current => {
            if (current.year !== currentYear) {
                currentYear = current.year;
                accRevenues = 0;
                accExpenses = 0;
            }

            accRevenues += current.revenues;
            accExpenses += current.expenses;

            return {
                date: current.date,
                label: current.label,
                year: current.year,
                revenues: accRevenues,
                expenses: accExpenses,
                result: accRevenues - accExpenses
            };
        });

        return { processedData, availableYears };
    }
}
