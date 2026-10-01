import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Petición al Backend Express
      const data = await apiAuth.register(formData);
      
      // Guardar localmente la lista de usuarios del sistema para permitir login posterior
      const existingUsers = JSON.parse(localStorage.getItem('snail_registered_users') || '[]');
      
      if (existingUsers.some((u: any) => u.email === data.user.email)) {
        throw new Error('El correo electrónico ya está registrado.');
      }

      existingUsers.push({ ...data.user, password: formData.password });
      localStorage.setItem('snail_registered_users', JSON.stringify(existingUsers));

      // Iniciar sesión automáticamente con el nuevo usuario
      register(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🐌 Registro de Apostador</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre Completo:</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
        </div>
        <div>
          <label>Correo Electrónico:</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
        </div>
        <div>
          <label>Confirmar Contraseña:</label>
          <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', marginBottom: '15px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Registrarse</button>
      </form>
      <p style={{ marginTop: '15px' }}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </div>
  );
};

