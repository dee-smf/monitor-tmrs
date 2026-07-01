export class DataProcessor {
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

const _dataProcessor = new DataProcessor();

export function processData(rawData, formatMonthYear) {
    return _dataProcessor.process(rawData, formatMonthYear);
}
