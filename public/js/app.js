import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './presentation/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './presentation/JsDelivrChartRenderer.js';
import { ResultOperation } from './domain/operations/ResultOperation.js';
import { Rolling12PeriodSumOperation } from './domain/operations/Rolling12PeriodSumOperation.js';

const repository = new JsonTimeSeriesRepository();
const timeSeriesData = await repository.load('data/timeSeries.json');

const resultOp = new ResultOperation();
const result = resultOp.execute(timeSeriesData);

const rollingOp = new Rolling12PeriodSumOperation();
const rolling = rollingOp.execute(result);
console.log(rolling);

const tableRenderer = new HtmlTableRenderer('#application');
tableRenderer.render(rolling);

const chartRenderer = new JsDelivrChartRenderer('#application');
chartRenderer.render(rolling);
