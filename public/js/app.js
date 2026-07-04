import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');
console.log(timeSeriesData);
