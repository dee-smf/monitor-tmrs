import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { formatDate, formatCurrency } from './presentation/formatters.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');

const formatted = timeSeriesData.rows.map(row => ({
  period: formatDate(row.period),
  expenses: formatCurrency(row.expenses),
  revenues: formatCurrency(row.revenues),
}));
console.log(formatted);
