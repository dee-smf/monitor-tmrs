import { GetCumulativeSumByYearUseCase } from '../../application/usecases/GetCumulativeSumByYearUseCase.js';
import { GetResultUseCase } from '../../application/usecases/GetResultUseCase.js';
import { GetRolling12PeriodSumUseCase } from '../../application/usecases/GetRolling12PeriodSumUseCase.js';

export const dataVisualizationModeMap = {
    CUM_SUM_BY_YEAR: GetCumulativeSumByYearUseCase,
    RESULT: GetResultUseCase,
    ROLLING_12_PERIOD_SUM: GetRolling12PeriodSumUseCase
};

export class DataVisualizationModeController {
    constructor(repository, tableRenderer, chartRenderer, map = dataVisualizationModeMap) {
        this._repository = repository;
        this._tableRenderer = tableRenderer;
        this._chartRenderer = chartRenderer;
        this._map = map;
    }

    async handle(request) {
        const usecase = new this._map[request.mode](this._repository);
        const result = await usecase.execute(request);
        this._tableRenderer.render(result);
        this._chartRenderer.render(result);
    }

};