// Expresión regular estándar para comprobar correos electrónicos
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginData {
  email: string;
  password?: string;
}

export function validateLoginForm(data: LoginData): { isValid: boolean; error: string } {
  const emailClean = data.email.trim();

  // 1. Validar que los campos no estén vacíos
  if (!emailClean) {
    return { isValid: false, error: 'El correo electrónico es obligatorio.' };
  }

  if (!data.password || data.password.trim() === '') {
    return { isValid: false, error: 'La contraseña es obligatoria.' };
  }

  // 2. Validar el formato del correo electrónico
  if (!EMAIL_REGEX.test(emailClean)) {
    return { isValid: false, error: 'El formato del correo electrónico no es válido.' };
  }

  // 3. Validar longitud mínima de seguridad para la contraseña
  if (data.password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  // Si pasa todos los filtros
  return { isValid: true, error: '' };
}