import { JsonTimeSeriesRepository } from './infrastructure/repositories/JsonTimeSeriesRepository.js';
import { JsonRveSentRepository } from './infrastructure/repositories/JsonRveSentRepository.js';
import { GitHubTagRepository } from './infrastructure/repositories/GitHubTagRepository.js';
import { GitHubLastDataCheckRepository } from './infrastructure/repositories/GitHubLastDataCheckRepository.js';
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
    const rveSentRepository = new JsonRveSentRepository('data/rveSentTimeSeries.json');
    const tableRenderer = new HtmlTableRenderer('#table-container');
    const chartRenderer = new JsDelivrChartRenderer('#chart-container');
    const tagRepo = new GitHubTagRepository('dee-smf', 'monitor-tmrs');
    const lastDataCheckRepo = new GitHubLastDataCheckRepository('dee-smf', 'monitor-tmrs');
    const reportHeader = new ReportHeaderRenderer('#report-header', lastDataCheckRepo);
    const controller = new DataVisualizationModeController(repository, tableRenderer, chartRenderer, rveSentRepository);

    const modeSelector = new HtmlModeSelectorRenderer('#mode-selector', repository, undefined, async (req) => {
        chartContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        await reportHeader.render(req);
        controller.handle(req);
    });

    await modeSelector.render();
    const copyright = new CopyrightSectionRenderer('#copyright-section', tagRepo, 'https://github.com/dee-smf/monitor-tmrs');
    copyright.render();
}

main();
