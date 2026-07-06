import { UseCaseInterface } from '../UseCaseInterface.js';
import { ResultOperation } from '../operations/ResultOperation.js';

export class GetResultUseCase extends UseCaseInterface {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async execute(request) {
    let dto = await this.repository.load();
    dto = new ResultOperation().execute(dto);
    return dto;
  }
}
