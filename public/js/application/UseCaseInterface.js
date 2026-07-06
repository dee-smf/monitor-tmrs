export class RequestModel {
    constructor(mode, year = null) {
        this.mode = mode,
        this.year = year
    }
}

export class UseCaseInterface {
  async execute(input) {
    throw new Error('Method not implemented');
  }
}
