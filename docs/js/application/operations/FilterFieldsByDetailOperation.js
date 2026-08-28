import { DataOperation } from '../../domain/DataOperation.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

const DETAIL_OFF_KEYS = ['period', 'revenues', 'expenses', 'result'];
const DETAIL_ON_KEYS = ['period', 'revenues', 'collection', 'landfill', 'result'];

export class FilterFieldsByDetailOperation extends DataOperation {
  constructor(detailExpenses) {
    super();
    this._detailExpenses = detailExpenses;
  }

  execute(dto) {
    const allowedKeys = this._detailExpenses ? DETAIL_ON_KEYS : DETAIL_OFF_KEYS;
    const rows = dto.rows.map(row => {
      const filtered = {};
      for (const key of allowedKeys) {
        if (key in row) filtered[key] = row[key];
      }
      return filtered;
    });
    return new TimeSeries(rows);
  }
}
