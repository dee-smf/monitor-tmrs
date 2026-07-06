import { JsonTimeSeriesRepository } from './infrastructure/repositories/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './infrastructure/views/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './infrastructure/views/JsDelivrChartRenderer.js';
import { DataVisualizationModeController } from './adapters/controllers/DataVisualizationModeController.js';

const DATA_PATH = 'data/timeSeries.json';
const repository = new JsonTimeSeriesRepository(DATA_PATH);

const tableRenderer = new HtmlTableRenderer('#application');
const chartRenderer = new JsDelivrChartRenderer('#application');

const controller = new DataVisualizationModeController(repository, tableRenderer, chartRenderer);

controller.handle({mode: "CUM_SUM_BY_YEAR", year: 2025});
