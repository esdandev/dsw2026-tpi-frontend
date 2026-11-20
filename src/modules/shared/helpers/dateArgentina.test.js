import { describe, it, expect } from 'node:test'; 
import {
  formatDateAR,
  formatTimeAR,
  formatDateTimeAR,
  toApiDateFilter,
} from './dateArgentina.js';

describe('dateArgentina helper', () => {
  it('convierte UTC a America/Argentina/Buenos_Aires (UTC-3)', () => {

    const utcIso = '2026-10-28T13:30:00Z';
    expect(formatDateAR(utcIso)).toBe('28/10/2026');
    expect(formatTimeAR(utcIso)).toBe('10:30');
    expect(formatDateTimeAR(utcIso)).toContain('28/10/2026');
    expect(formatDateTimeAR(utcIso)).toContain('10:30');
  });

  it('ajusta el cambio de día cuando UTC es madrugada (01:30Z -> 22:30 día anterior en AR)', () => {
    const utcMidnightCross = '2026-10-28T01:30:00Z';
    expect(formatDateAR(utcMidnightCross)).toBe('27/10/2026');
    expect(formatTimeAR(utcMidnightCross)).toBe('22:30');
    expect(toApiDateFilter(utcMidnightCross)).toBe('2026-10-27');
  });

  it('preserva filtros de fecha YYYY-MM-DD', () => {
    expect(toApiDateFilter('2026-11-05')).toBe('2026-11-05');
  });
});