import { useState } from 'react'; 
import { fiscalizadores } from './data/fiscalizadores.js';
import Certificado from './components/Certificado.jsx';

function App() {
  const [dni, setDni] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [error, setError] = useState('');

  const handleBuscar = () => {
    if (dni.length === 8) {
      const resultado = fiscalizadores.find(p => p.dni === dni);
      if (resultado) {
        setPersonaEncontrada(resultado);
        setError('');
      } else {
        setError('DNI no encontrado');
        setPersonaEncontrada(null);
      }
    } else {
      setError('El DNI debe tener 8 dígitos');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '16px', fontFamily: 'sans-serif' }}>
      
      {/* Contenedor tipo Tarjeta */}
      <div style={{ backgroundColor: 'white', borderRadius: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', maxWidth: '420px', width: '100%', overflow: 'hidden', position: 'relative', border: '1px solid #edf2f7' }}>
        
        {/* Franja Superior Roja */}
        <div style={{ height: '16px', backgroundColor: '#b01e23', width: '100%' }}></div>
        <div style={{ height: '24px', backgroundColor: '#b01e23', width: '92%', margin: '-4px auto 0', borderRadius: '0 0 15px 15px' }}></div>

        <div style={{ padding: '40px', paddingTop: '16px', textAlign: 'center' }}>
          {/* Logo JNE */}
          <img src="/img/logo.png" alt="Logo JNE" style={{ height: '150px', margin: '0 auto 16px', display: 'block', objectFit: 'contain' }} />
          
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#b01e23', lineHeight: '1.2', margin: '0' }}>Consulta de Constancia</h1>
          <p style={{ color: '#4a5568', fontWeight: 'bold', fontSize: '18px', marginTop: '8px', marginBottom: '32px' }}>Elecciones Generales 2026 - Primera vuelta</p>

          {/* Input DNI */}
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              maxLength="8" 
              placeholder="Ingresa DNI"
              style={{ width: '100%', padding: '16px', border: '1.5px solid #cbd5e0', borderRadius: '12px', textAlign: 'center', color: '#718096', fontSize: '20px', outline: 'none', boxSizing: 'border-box' }}
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{error}</p>}
          </div>

          {/* Botón Rojo */}
          <button 
            onClick={handleBuscar}
            style={{ width: '85%', padding: '16px', backgroundColor: '#b01e23', color: 'white', fontWeight: 'bold', borderRadius: '12px', fontSize: '18px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#8e181c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#b01e23'}
          >
            Visualizar Certificado
          </button>

          <div style={{ borderTop: '1px solid #edf2f7', width: '100%', margin: '32px 0' }}></div>
          <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '14px', lineHeight: '1.5', padding: '0 16px', fontWeight: '500' }}>
            "Gracias por asumir el reto con responsabilidad como fiscalizadores de local de votación de estas elecciones electorales 2026"
          </p>
        </div>
      </div>

      {personaEncontrada && (
        <Certificado 
          persona={personaEncontrada} 
          alCerrar={() => setPersonaEncontrada(null)} 
        />
      )}
    </div>
  );
}

export default App;
