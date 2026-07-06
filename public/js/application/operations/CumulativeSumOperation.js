import { DataOperation } from '../../domain/DataOperation.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class CumulativeSumOperation extends DataOperation {
  execute(dto) {
    const numericKeys = Object.keys(dto.rows[0]).filter(
      key => typeof dto.rows[0][key] === 'number' && key !== 'period'
    );

    const running = {};
    for (const key of numericKeys) running[key] = 0;

    const rows = dto.rows.map(row => {
      const accumulated = { period: row.period };
      for (const key of numericKeys) {
        running[key] += row[key];
        accumulated[key] = running[key];
      }
      return accumulated;
    });

    return new TimeSeries(rows);
  }
}
