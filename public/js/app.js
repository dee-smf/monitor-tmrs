import { JsonTimeSeriesRepository } from './infrastructure/repositories/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './infrastructure/views/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './infrastructure/views/JsDelivrChartRenderer.js';
import { DataVisualizationModeController } from './adapters/controllers/DataVisualizationModeController.js';
import { HtmlModeSelectorRenderer } from './infrastructure/views/HtmlModeSelectorRenderer.js';

async function main() {
    const app = document.querySelector('#application');

    const results = document.createElement('div');
    results.id = 'results';
    app.appendChild(results);

    const repository = new JsonTimeSeriesRepository('data/timeSeries.json');
    const tableRenderer = new HtmlTableRenderer('#results');
    const chartRenderer = new JsDelivrChartRenderer('#results');
    const controller = new DataVisualizationModeController(repository, tableRenderer, chartRenderer);

    const modeSelector = new HtmlModeSelectorRenderer('#application', repository, undefined, (req) => {
        results.innerHTML = '';
        controller.handle(req);
    });

    await modeSelector.render();

    app.appendChild(results);
}

main();