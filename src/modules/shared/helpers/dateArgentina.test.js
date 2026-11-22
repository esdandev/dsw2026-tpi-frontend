import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  formatDateAR,
  formatTimeAR,
  formatDateTimeAR,
  toApiDateFilter,
} from './dateArgentina.js';

describe('dateArgentina helper', () => {
  it('convierte UTC a America/Argentina/Buenos_Aires (UTC-3)', () => {
    const utcIso = '2026-10-28T13:30:00Z';

    assert.equal(formatDateAR(utcIso), '28/10/2026');
    assert.equal(formatTimeAR(utcIso), '10:30');
    assert.match(formatDateTimeAR(utcIso), /28\/10\/2026.*10:30/);
  });

  it('ajusta el cambio de día cuando UTC es madrugada (01:30Z -> 22:30 día anterior en AR)', () => {
    const utcMidnightCross = '2026-10-28T01:30:00Z';

    assert.equal(formatDateAR(utcMidnightCross), '27/10/2026');
    assert.equal(formatTimeAR(utcMidnightCross), '22:30');
    assert.equal(toApiDateFilter(utcMidnightCross), '2026-10-27');
  });

  it('preserva filtros de fecha YYYY-MM-DD', () => {
    assert.equal(toApiDateFilter('2026-11-05'), '2026-11-05');
  });

  it('suma dias incluso en el cambio de anio', () => {
    assert.equal(addDays('2026-11-23', 7), '2026-11-30');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  });
});
