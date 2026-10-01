const API_URL = 'http://localhost:3000/api/auth'; // Asegúrate de que tu backend corra en este puerto

export const apiAuth = {
  async register(data: any) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Error en el registro');
    return result;
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Error en el login');
    return result;
  }
};

