import { JsonTimeSeriesRepository } from './infrastructure/repositories/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './infrastructure/views/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './infrastructure/views/JsDelivrChartRenderer.js';
import { DataVisualizationModeController } from './adapters/controllers/DataVisualizationModeController.js';
import { RequestModel } from './application/UseCaseInterface.js';
import { HtmlModeSelectorRenderer } from './infrastructure/views/HtmlModeSelectorRenderer.js';

const DATA_PATH = 'data/timeSeries.json';
const repository = new JsonTimeSeriesRepository(DATA_PATH);

const tableRenderer = new HtmlTableRenderer('#application');
const chartRenderer = new JsDelivrChartRenderer('#application');

const controller = new DataVisualizationModeController(repository, tableRenderer, chartRenderer);

const dummyRequest = new RequestModel("RESULT")
controller.handle(dummyRequest);

const modeSelector = new HtmlModeSelectorRenderer('#application', repository);
await modeSelector.render();