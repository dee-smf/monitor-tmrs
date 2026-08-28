import { UseCaseInterface } from '../UseCaseInterface.js';
import { FilterByYearOperation } from '../operations/FilterByYearOperation.js';
import { ResultOperation } from '../operations/ResultOperation.js';
import { FilterFieldsByDetailOperation } from '../operations/FilterFieldsByDetailOperation.js';

export class GetResultUseCase extends UseCaseInterface {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async execute(request) {
    const { year, detailExpenses } = request;
    let dto = await this.repository.load();
    if (year !== null) dto = new FilterByYearOperation(year).execute(dto);
    dto = new ResultOperation().execute(dto);
    dto = new FilterFieldsByDetailOperation(detailExpenses).execute(dto);
    return dto;
  }
}
