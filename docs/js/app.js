import { JsonTimeSeriesRepository } from './infrastructure/repositories/JsonTimeSeriesRepository.js';
import { GitHubTagRepository } from './infrastructure/repositories/GitHubTagRepository.js';
import { HtmlTableRenderer } from './infrastructure/views/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './infrastructure/views/JsDelivrChartRenderer.js';
import { ReportHeaderRenderer } from './infrastructure/views/ReportHeaderRenderer.js';
import { CopyrightSectionRenderer } from './infrastructure/views/CopyrightSectionRenderer.js';
import { DataVisualizationModeController } from './adapters/controllers/DataVisualizationModeController.js';
import { HtmlModeSelectorRenderer } from './infrastructure/views/HtmlModeSelectorRenderer.js';

async function main() {
    const chartContainer = document.querySelector('#chart-container');
    const tableContainer = document.querySelector('#table-container');

    const repository = new JsonTimeSeriesRepository('data/timeSeries.json');
    const tableRenderer = new HtmlTableRenderer('#table-container');
    const chartRenderer = new JsDelivrChartRenderer('#chart-container');
    const reportHeader = new ReportHeaderRenderer('#report-header');
    const controller = new DataVisualizationModeController(repository, tableRenderer, chartRenderer);

    const modeSelector = new HtmlModeSelectorRenderer('#mode-selector', repository, undefined, (req) => {
        chartContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        reportHeader.render(req);
        controller.handle(req);
    });

    await modeSelector.render();

    const tagRepo = new GitHubTagRepository('dee-smf', 'monitor-tmrs');
    const copyright = new CopyrightSectionRenderer('#copyright-section', tagRepo, 'https://github.com/dee-smf/monitor-tmrs');
    copyright.render();
}

main();
