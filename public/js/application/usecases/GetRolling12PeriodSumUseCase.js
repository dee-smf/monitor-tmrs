import { UseCase } from '../../domain/UseCase.js';
import { Rolling12PeriodSumOperation } from '../operations/Rolling12PeriodSumOperation.js';
import { ResultOperation } from '../operations/ResultOperation.js';

export class GetRolling12PeriodSumUseCase extends UseCase {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async execute() {
    let dto = await this.repository.load();
    dto = new Rolling12PeriodSumOperation().execute(dto);
    dto = new ResultOperation().execute(dto);
    return dto;
  }
}
