import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseBackendError } from './backendError.js';

describe('parseBackendError helper', () => {
  it('mapea errorCode y details a fieldErrors en camelCase', () => {
    const axiosError = {
      response: {
        status: 400,
        data: {
          errorCode: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'licenseNumber', issue: 'required' },
            { field: 'pageSize', issue: 'invalid_format' },
          ],
        },
      },
    };

    const result = parseBackendError(axiosError);

    assert.equal(result.status, 400);
    assert.equal(result.errorCode, 'VALIDATION_ERROR');
    assert.equal(
      result.fieldErrors.licenseNumber,
      'Este campo es obligatorio.'
    );
    assert.equal(
      result.fieldErrors.pageSize,
      'El formato ingresado no es válido.'
    );
  });

  it('mapea códigos de negocio específicos como DOCTOR_LICENSE_CONFLICT', () => {
    const axiosError = {
      response: {
        status: 409,
        data: { errorCode: 'DOCTOR_LICENSE_CONFLICT', details: [] },
      },
    };

    const result = parseBackendError(axiosError);

    assert.equal(
      result.message,
      'Ya existe un médico registrado con esa matrícula.'
    );
  });

  it('devuelve mensaje por código HTTP cuando no hay errorCode conocido', () => {
    const result429 = parseBackendError({
      response: { status: 429, data: {} },
    });
    const result500 = parseBackendError({
      response: { status: 500, data: {} },
    });

    assert.match(result429.message, /Demasiadas peticiones/);
    assert.match(result500.message, /Error interno del servidor/);
  });

  it('maneja errores de red sin response sin romper', () => {
    const result = parseBackendError(new Error('Network Error'));

    assert.equal(result.errorCode, 'NETWORK_ERROR');
    assert.match(result.message, /conectar con el servidor/);
  });
});
