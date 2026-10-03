import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importaciones necesarias para Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Dashboard = () => {

  // 1. controla el switch de error del sistema
const [simulateSystemDown, setSimulateSystemDown] = useState<boolean>(false);

  
const [cardData, setCardData] = useState({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  fullName: '',
  amount: ''
});

  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  
  // Estados para la recarga simulada con SnailPay  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- DATOS SIMULADOS CONGRUENTES (6 carreras en el día) ---
  // Los caracoles se reparten exactamente las 6 victorias del día.
  const snailNames = ['Turbo', 'Rayo', 'Caparazón Feroz', 'Flash Lento', 'Bala de Jardín', 'Salta Lento'];
  const snailVictories = [2, 1, 2, 0, 1, 0]; // Suma exacta: 6 victorias en 6 carreras.

  // --- CONFIGURACIÓN GRÁFICA DE BARRAS (Victorias) ---
  const barData = {
    labels: snailNames,
    datasets: [
      {
        label: 'Victorias del Día',
        data: snailVictories,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Historial de Victorias (6 Carreras Totales)' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }, // Solo números enteros ya que son carreras
      },
    },
  };

  // --- CONFIGURACIÓN GRÁFICA DONUT (Apuestas) ---
  const doughnutData = {
    labels: ['Ganadas', 'Perdidas'],
    datasets: [
      {
        data: [14, 8], // Datos simulados de balance histórico de apuestas
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Proporción de Apuestas Ganadas vs Perdidas' },
    },
  };

 const handleSnailPayCharge = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  setIsLoading(true);
  setPaymentMessage(null);

  try {
    // Uso local
    // const response = await fetch('http://localhost:3000/api/snailpay/charge', {
    // Uso de Render  
    const response = await fetch('https://pedro-2909-backend.onrender.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(simulateSystemDown && { 'X-SnailPay-Simulation': 'INTERNAL_SERVER_ERROR' })
      },
      body: JSON.stringify({
        cardNumber: cardData.cardNumber,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        fullName: cardData.fullName,
        amount: cardData.amount,
        userId: user.id,
        userEmail: user.email
      })
    });

    const result = await response.json();

    // Guardar el log transaccional completo en LocalStorage (Requisito 2.4)
    const transactionLogs = JSON.parse(localStorage.getItem('snail_payment_logs') || '[]');
    transactionLogs.push({
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      transaction_amount: result.transaction_amount,
      date_created: result.date_created,
      authorization_code: result.authorization_code,
      reference: result.reference,
      payer_id: result.payer_id,
      payer_email: result.payer_email,
      // Se guardan los datos ficticios asociados devueltos por el servicio
      fictitious_card: result.card_info 
    });
    localStorage.setItem('snail_payment_logs', JSON.stringify(transactionLogs));

    // Si el estado HTTP no es exitoso (400, 402, 500)
    if (!response.ok) {
      throw { message: result.message || 'Error en la operación', detail: result.status_detail };
    }

    // --- MANEJO DE OPERACIÓN APROBADA ---
    // Convertimos el monto de dólares de la transacción a centavos para sumar al balance interno
    const amountInCentavos = result.transaction_amount * 100;
    const nuevoSaldo = user.balance + amountInCentavos;

    const usuarioActualizado = { ...user, balance: nuevoSaldo };
    login(usuarioActualizado);

    // Sincronizar usuario en persistencia global
    const registeredUsers = JSON.parse(localStorage.getItem('snail_registered_users') || '[]');
    const index = registeredUsers.findIndex((u: any) => u.email === user.email);
    if (index !== -1) {
      registeredUsers[index].balance = nuevoSaldo;
      localStorage.setItem('snail_registered_users', JSON.stringify(registeredUsers));
    }

    setPaymentMessage({ 
      type: 'success', 
      text: `🎉 APROBADA (Código: ${result.authorization_code}). Ref: ${result.reference}. ${result.message}` 
    });
    
    setCardData({ cardNumber: '', expiryDate: '', cvv: '', fullName: '', amount: '' });

  } catch (err: any) {
    // --- MANEJO DE OPERACIONES DE ERROR (El saldo NO se modifica) ---
    setPaymentMessage({ 
      type: 'error', 
      text: `❌ Error: ${err.message} [Detalle Técnico: ${err.detail || 'internal_system_error'}]` 
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Encabezado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0 }}>🐌 Apuestas Caracoles Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Apostador: <strong>{user?.fullName}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0, color: '#28a745' }}>Saldo Cuenta: \${(user?.balance ?? 0) / 100} USD</h3>
          <button onClick={handleLogout} style={{ marginTop: '5px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Grid Principal para Gráficas y Pasarela */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
        
        {/* Panel de Gráficas */}
        <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Estadísticas de Carreras</h3>
          <div style={{ width: '100%', height: '250px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '220px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </section>

        {/* Panel de SnailPay */}
       <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', height: 'fit-content' }}>
  <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Pasarela de Pagos (SnailPay Simulador)</h3>
  
  <form onSubmit={handleSnailPayCharge} style={{ marginTop: '15px' }}>
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Nombre del Titular:</label>
      <input 
        type="text" required placeholder="Ej. Pedro Pérez" disabled={isLoading}
        value={cardData.fullName} onChange={e => setCardData({...cardData, fullName: e.target.value})}
        style={{ width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Número de Tarjeta de Pruebas:</label>
      <input 
        type="text" required placeholder="1234123412341234" maxLength={16} disabled={isLoading}
        value={cardData.cardNumber} onChange={e => setCardData({...cardData, cardNumber: e.target.value})}
        style={{ width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>

    <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Vencimiento:</label>
        <input 
          type="text" required placeholder="12/26" maxLength={5} disabled={isLoading}
          value={cardData.expiryDate} onChange={e => setCardData({...cardData, expiryDate: e.target.value})}
          style={{ width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>CVV:</label>
        <input 
          type="password" required placeholder="543" maxLength={3} disabled={isLoading}
          value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})}
          style={{ width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
    </div>

    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Monto a Recargar (USD):</label>
      <input 
        type="number" required min="1" placeholder="Monto mayor a 0" disabled={isLoading}
        value={cardData.amount} onChange={e => setCardData({...cardData, amount: e.target.value})}
        style={{ width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>

    <div style={{ 
  marginBottom: '15px', 
  padding: '10px', 
  backgroundColor: '#fff3cd', 
  border: '1px solid #ffeeba', 
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}}>
  <input 
    type="checkbox" 
    id="toggle-error"
    checked={simulateSystemDown}
    onChange={(e) => setSimulateSystemDown(e.target.checked)}
    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
  />
  <label htmlFor="toggle-error" style={{ color: '#856404', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
    ⚠️ Simular caída del sistema SnailPay (HTTP 500)
  </label>
</div>

    <button 
      type="submit" 
      disabled={isLoading}
      style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
    >
      {isLoading ? 'Procesando Pago Simulador...' : 'Enviar Pago SnailPay'}
    </button>
  </form>

  {paymentMessage && (
    <div style={{ marginTop: '20px', padding: '12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', backgroundColor: paymentMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: paymentMessage.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${paymentMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
      {paymentMessage.text}
    </div>
  )}
</section>

      </div>
    </div>
  );
};