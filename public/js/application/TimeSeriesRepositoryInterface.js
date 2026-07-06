export class TimeSeriesRepositoryInterface {
  constructor(path) {
    this.path = path;
  }

  async load() {
    throw new Error('Method not implemented');
  }
}
