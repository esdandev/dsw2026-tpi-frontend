import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeToken, getTokenRole, isTokenValid } from './token.js';

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function encode(part) {
  return btoa(JSON.stringify(part))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildToken(payload) {
  return `${encode({ alg: 'none' })}.${encode(payload)}.firma`;
}

describe('token helper', () => {
  it('extrae el rol del claim corto del JWT', () => {
    const token = buildToken({
      role: 'ADMINISTRADOR',
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    assert.equal(getTokenRole(token), 'ADMINISTRADOR');
  });

  it('normaliza el rol del claim largo de .NET como lo firma el backend', () => {
    const token = buildToken({
      [ROLE_CLAIM]: 'Paciente',
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    assert.equal(getTokenRole(token), 'PACIENTE');
  });

  it('invalida un token vencido', () => {
    const token = buildToken({
      role: 'PACIENTE',
      exp: Math.floor(Date.now() / 1000) - 1,
    });

    assert.equal(isTokenValid(token), false);
  });

  it('invalida un token malformado o vacio sin romper', () => {
    assert.equal(decodeToken('sin.puntos'), null);
    assert.equal(isTokenValid(''), false);
    assert.equal(isTokenValid(null), false);
  });
});
