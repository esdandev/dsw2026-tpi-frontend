import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBackendError } from './backendError.js';

describe('errores del backend', () => {
  it('muestra el detalle de una superposición de disponibilidades', () => {
    const result = parseBackendError({
      response: {
        status: 400,
        data: {
          errorCode: 'VALIDATION_ERROR',
          details: [
            { field: 'days', issue: 'Los horarios del día LUNES se solapan' },
          ],
        },
      },
    });

    assert.equal(
      result.fieldErrors.days,
      'Los horarios del día LUNES se solapan'
    );
  });

  it('explica por qué un médico con turnos futuros no se puede eliminar', () => {
    const result = parseBackendError({
      response: {
        status: 409,
        data: { errorCode: 'DOCTOR_HAS_FUTURE_APPOINTMENTS' },
      },
    });

    assert.match(result.message, /turnos futuros/);
  });
});
