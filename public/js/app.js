import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './presentation/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './presentation/JsDelivrChartRenderer.js';
import { ResultOperation } from './domain/operations/ResultOperation.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');

const operation = new ResultOperation();
const result = operation.execute(timeSeriesData);
console.log(result);

const tableRenderer = new HtmlTableRenderer('#application');
tableRenderer.render(result);

const chartRenderer = new JsDelivrChartRenderer('#application');
chartRenderer.render(result);
