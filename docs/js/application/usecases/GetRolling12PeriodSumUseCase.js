import { UseCaseInterface } from '../UseCaseInterface.js';
import { Rolling12PeriodSumOperation } from '../operations/Rolling12PeriodSumOperation.js';
import { ResultOperation } from '../operations/ResultOperation.js';
import { FilterByYearOperation } from '../operations/FilterByYearOperation.js';
import { FilterFieldsByDetailOperation } from '../operations/FilterFieldsByDetailOperation.js';

export class GetRolling12PeriodSumUseCase extends UseCaseInterface {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async execute(request) {
    const { year, detailExpenses } = request;
    let dto = await this.repository.load();
    dto = new ResultOperation().execute(dto);
    dto = new FilterFieldsByDetailOperation(detailExpenses).execute(dto);
    dto = new Rolling12PeriodSumOperation().execute(dto);
    if (year !== null) dto = new FilterByYearOperation(year).execute(dto);
    return dto;
  }
}
