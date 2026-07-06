import { UseCaseInterface } from '../UseCaseInterface.js';
import { FilterByYearOperation } from '../operations/FilterByYearOperation.js';
import { CumulativeSumOperation } from '../operations/CumulativeSumOperation.js';
import { ResultOperation } from '../operations/ResultOperation.js';

export class GetCumulativeSumByYearUseCase extends UseCaseInterface {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async execute(year) {
    let dto = await this.repository.load();
    dto = new FilterByYearOperation(year).execute(dto);
    dto = new CumulativeSumOperation().execute(dto);
    dto = new ResultOperation().execute(dto);
    return dto;
  }
}
