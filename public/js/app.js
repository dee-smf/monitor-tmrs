import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './presentation/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './presentation/JsDelivrChartRenderer.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');

const tableRenderer = new HtmlTableRenderer('#application');
tableRenderer.render(timeSeriesData);

const chartRenderer = new JsDelivrChartRenderer('#application');
chartRenderer.render(timeSeriesData);
