import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { TableRenderer } from './presentation/TableRenderer.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');

const renderer = new TableRenderer('#application');
renderer.render(timeSeriesData);
