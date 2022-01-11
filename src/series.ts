/**
 * Series of numbers: used for delays and timeouts.
 * - const
 * - exponential
 * - custom
 */

export type SeriesParams = ConstructorParameters<typeof ConstSeries>[0]
  | ConstructorParameters<typeof CustomSeries>[0]
  | ConstructorParameters<typeof ExponentSeries>[0];

export function seriesFactory(params: SeriesParams): Series {
  if (typeof params === 'number') return new ConstSeries(params);
  if (Array.isArray(params)) return new CustomSeries(params);
  return new ExponentSeries(params);
}

export interface Series {
  get current(): number;
  next(): number;
}

export class ConstSeries implements Series {
  constructor(public current: number) { }
  next() {
    return this.current;
  }
}

export class CustomSeries implements Series {
  private index = 0;
  constructor(protected series: number[]) { }

  get current() {
    return this.series[this.index];
  }

  next() {
    if (this.index < this.series.length - 1) this.index++;
    return this.current;
  }
}

export interface ExponentSeriesParams {
  min?: number;
  factor?: number;
  max?: number;
}

export class ExponentSeries implements Series {
  private params: Required<ExponentSeriesParams> = {
    min: 100,
    factor: 2,
    max: Infinity,
  };
  current: number;

  constructor(params?: ExponentSeriesParams) {
    Object.assign(this.params, params);
    this.current = this.params.min;
  }

  next() {
    const { factor, max } = this.params;
    this.current = Math.min(this.current * factor, max);
    return this.current;
  }
}
