import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSlotDateKey,
  getSlotId,
  getSlotTimeLabel,
  isSlotAvailable,
} from './slot.js';

describe('slot helper', () => {
  it('acepta el id del slot en ambos contratos', () => {
    assert.equal(getSlotId({ availabilitySlotId: 'a', id: 'b' }), 'a');
    assert.equal(getSlotId({ id: 'b' }), 'b');
  });

  it('ubica el slot por fecha o por inicio UTC', () => {
    assert.equal(
      getSlotDateKey({ date: '2026-11-23', startTime: '12:30' }),
      '2026-11-23'
    );
    assert.equal(
      getSlotDateKey({ start: '2026-11-23T13:00:00Z' }),
      '2026-11-23'
    );
  });

  it('muestra la hora local a partir de startTime o del inicio UTC', () => {
    assert.equal(getSlotTimeLabel({ startTime: '12:30:00' }), '12:30');
    assert.equal(getSlotTimeLabel({ start: '2026-11-23T13:00:00Z' }), '10:00');
  });

  it('descarta slots no disponibles', () => {
    assert.equal(isSlotAvailable({ status: 'BOOKED' }), false);
    assert.equal(isSlotAvailable({ status: 'AVAILABLE' }), true);
    assert.equal(isSlotAvailable({}), true);
  });
});
