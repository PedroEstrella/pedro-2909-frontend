import { describe, it, expect } from 'vitest';
import { validateLoginForm } from './validateLogin';

describe('PRUEBAS UNITARIAS: VALIDACIÓN DE FORMULARIO DE LOGIN', () => {

  it('Debería aprobar un formulario con datos válidos', () => {
    const datosValidos = { email: 'apostador@correo.com', password: 'password123' };
    const resultado = validateLoginForm(datosValidos);

    expect(resultado.isValid).toBe(true);
    expect(resultado.error).toBe('');
  });

  it('Debería rechazar si el correo electrónico está vacío', () => {
    const datosInvalidos = { email: '   ', password: 'password123' };
    const resultado = validateLoginForm(datosInvalidos);

    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe('El correo electrónico es obligatorio.');
  });

  it('Debería rechazar si la contraseña está vacía', () => {
    const datosInvalidos = { email: 'test@correo.com', password: '' };
    const resultado = validateLoginForm(datosInvalidos);

    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe('La contraseña es obligatoria.');
  });

  it('Debería rechazar un formato de correo electrónico inválido', () => {
    const datosInvalidos = { email: 'correo-sin-arroba.com', password: 'password123' };
    const resultado = validateLoginForm(datosInvalidos);

    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe('El formato del correo electrónico no es válido.');
  });

  it('Debería rechazar una contraseña menor a 6 caracteres', () => {
    const datosInvalidos = { email: 'test@correo.com', password: '123' };
    const resultado = validateLoginForm(datosInvalidos);

    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe('La contraseña debe tener al menos 6 caracteres.');
  });
});