export class ProcessTimeSeriesUseCase {
  constructor(repository) {
    this.repository = repository;
    this.operations = [];
  }

  addOperation(operation) {
    this.operations.push(operation);
  }

  async execute(jsonPath) {
    let dto = await this.repository.load(jsonPath);
    for (const op of this.operations) {
      dto = op.execute(dto);
    }
    return dto;
  }
}
