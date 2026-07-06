import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './infrastructure/views/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './infrastructure/views/JsDelivrChartRenderer.js';
import { GetRolling12PeriodSumUseCase } from './application/usecases/GetRolling12PeriodSumUseCase.js';

const DATA_PATH = 'data/timeSeries.json';
const repository = new JsonTimeSeriesRepository(DATA_PATH);

const useCase = new GetRolling12PeriodSumUseCase(repository);

const result = await useCase.execute();
console.log(result);

const tableRenderer = new HtmlTableRenderer('#application');
tableRenderer.render(result);

const chartRenderer = new JsDelivrChartRenderer('#application');
chartRenderer.render(result);
