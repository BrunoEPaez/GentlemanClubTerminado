import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AuthPage = ({ onLogin }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'register') setIsLogin(false);
    else setIsLogin(true);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDACIÓN SIMPLE
    if (!email || !password) {
      alert("Por favor, completa todos los campos");
      return;
    }

    // ESTRUCTURA PARA GO: Enviamos email y password directamente
    const userData = { email, password };

    try {
      if (!isLogin) {
        // --- REGISTRO ---
        const response = await axios.post(`${API_URL}/api/register`, userData);
        // Guardamos con la clave 'gentleman-user' para que coincida con App y Navbar
        localStorage.setItem('gentleman-user', JSON.stringify(response.data));
        alert("¡CUENTA CREADA EXITOSAMENTE!");
      } else {
        // --- LOGIN ---
        // Cambiamos /api/signup por /api/login (que es la que pusimos en Go)
        const response = await axios.post(`${API_URL}/api/login`, userData);
        localStorage.setItem('gentleman-user', JSON.stringify(response.data));
        alert("¡BIENVENIDO DE VUELTA!");
      }
      
      navigate('/');
      window.location.reload(); 
    } catch (error: any) {
      // Manejo de errores de Go
      const msg = error.response?.data?.error || "Error de conexión con el servidor";
      alert("ERROR: " + msg);
    }
  };

  return (
    <div className="auth-container" style={{ 
      paddingTop: '140px', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0d0221 0%, #050110 100%)'
    }}>
      <div className="auth-card glass" style={{
        padding: '40px', 
        width: '400px', 
        borderRadius: '15px',
        border: '1px solid #00d2ff',
        boxShadow: '0 0 20px rgba(0, 210, 255, 0.1)',
        height: 'fit-content'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'white', letterSpacing: '2px' }}>
          {isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#00d2ff' }}>
              EMAIL
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" 
              required
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 210, 255, 0.3)', color: 'white', borderRadius: '4px' }} 
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#00d2ff' }}>
              CONTRASEÑA
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********" 
              required
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 210, 255, 0.3)', color: 'white', borderRadius: '4px' }} 
            />
          </div>

          <button type="submit" style={{ 
            width: '100%', padding: '15px', background: '#00d2ff', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {isLogin ? 'ENTRAR' : 'CREAR CUENTA'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p 
            style={{ cursor: 'pointer', fontSize: '13px', color: '#ff0055', textDecoration: 'underline' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Loguéate'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;