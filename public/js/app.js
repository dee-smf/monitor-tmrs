import { JsonTimeSeriesRepository } from './infrastructure/JsonTimeSeriesRepository.js';
import { HtmlTableRenderer } from './presentation/HtmlTableRenderer.js';
import { JsDelivrChartRenderer } from './presentation/JsDelivrChartRenderer.js';
import { ProcessTimeSeriesUseCase } from './application/ProcessTimeSeriesUseCase.js';
import { ResultOperation } from './domain/operations/ResultOperation.js';
import { Rolling12PeriodSumOperation } from './domain/operations/Rolling12PeriodSumOperation.js';
import { CumulativeSumOperation } from './domain/operations/CumulativeSumOperation.js';
import { FilterByYearOperation } from './domain/operations/FilterByYearOperation.js';

const repository = new JsonTimeSeriesRepository();

const useCase = new ProcessTimeSeriesUseCase(repository);
useCase.addOperation(new FilterByYearOperation(2025));
useCase.addOperation(new ResultOperation());
useCase.addOperation(new Rolling12PeriodSumOperation());
useCase.addOperation(new CumulativeSumOperation());

const result = await useCase.execute('data/timeSeries.json');
console.log(result);

const tableRenderer = new HtmlTableRenderer('#application');
tableRenderer.render(result);

const chartRenderer = new JsDelivrChartRenderer('#application');
chartRenderer.render(result);
