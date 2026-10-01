import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Validación en el Servidor
      await apiAuth.login({ email, password });

      // 2. Simulación de búsqueda en base de datos local
      const registeredUsers = JSON.parse(localStorage.getItem('snail_registered_users') || '[]');
      const matchedUser = registeredUsers.find((u: any) => u.email === email.toLowerCase().trim() && u.password === password);

      if (!matchedUser) {
        throw new Error('Credenciales incorrectas o usuario no encontrado.');
      }

      // Iniciar sesión y guardar sesión activa en LocalStorage
      login({
        id: matchedUser.id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        balance: matchedUser.balance
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🐌 Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Correo Electrónico:</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: '15px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Entrar</button>
      </form>
      <p style={{ marginTop: '15px' }}>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
    </div>
  );
};

