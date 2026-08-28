export class RequestModel {
    constructor(mode, year = null, detailExpenses = false) {
        this.mode = mode,
        this.year = year,
        this.detailExpenses = detailExpenses
    }
}

export class UseCaseInterface {
  async execute(input) {
    throw new Error('Method not implemented');
  }
}
