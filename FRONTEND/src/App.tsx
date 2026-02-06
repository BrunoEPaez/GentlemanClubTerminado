import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import './Global.css';      // Agregado
import './Landing.css';     // Agregado
import './ExplorarPage.css'; // Agregado
import SuccessPage from './pages/SuccessPage';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ExplorarPage from './pages/ExplorarPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetail from './pages/ProductDetail';
import SearchPage from './pages/SearchPage';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [notifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(() => {
  const savedUser = localStorage.getItem('gentleman-user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    return user.is_admin === true; // Verifica si el JSON tiene is_admin: true
  }
  return false;
}); 
  const [isMaintenance, setIsMaintenance] = useState(false);

  const [cart, setCart] = useState<any[]>(() => {
  const savedCart = localStorage.getItem('gentleman-cart'); // Cambiado
  return savedCart ? JSON.parse(savedCart) : [];
});

  // --- 1. DEFINIR LA FUNCIÓN QUE FALTABA ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error de conexión:", err);
      setLoading(false);
    }
  }, []);

  // --- NUEVO: Cargar el estado desde el Backend ---
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Consultamos el registro con key 'maintenance_mode'
        const res = await axios.get(`${API_URL}/api/settings/maintenance_mode`);
        setIsMaintenance(res.data.value);
      } catch (e) {
        console.error("Error al leer modo mantenimiento", e);
      }
    };
    checkMaintenance();
  }, []);

  // Carga inicial de productos
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
  localStorage.setItem('gentleman-cart', JSON.stringify(cart)); // Cambiado
}, [cart]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() !== "") navigate('/buscar');
    else navigate('/');
  };

  const addToCart = (product: any, selectedSize: string = "Único") => {
  setCart((prevCart) => {
    // La clave ahora es ID + Talle para que no se mezclen
    const itemExists = prevCart.find(item => item.id === product.id && item.size === selectedSize);
    if (itemExists) {
      return prevCart.map(item => 
        (item.id === product.id && item.size === selectedSize) 
        ? { ...item, quantity: item.quantity + 1 } : item
      );
    }
    return [...prevCart, { ...product, quantity: 1, size: selectedSize }];
  });
};

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  // Manejo de clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNavMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNavMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNavMenu]);


const handleLogin = async (email: any, password: any) => {
  try {
    const res = await axios.post(`${API_URL}/api/login`, { email, password });
    const user = res.data;
    
    // Guardamos el usuario (esto es lo que habilita que isAdmin sea true o que el panel cargue)
    localStorage.setItem('gentleman-user', JSON.stringify(user));
    
    // AHORA: Seteamos isAdmin en true para CUALQUIER usuario que se loguee con éxito
    setIsAdmin(true); 
    
    alert("¡SESIÓN INICIADA!");
    navigate('/admin'); // Directo al panel
  } catch (err) {
    alert("Error al iniciar sesión: Credenciales incorrectas");
  }
};


  return (
    <div className="app-container">
      <Navbar 
        showNavMenu={showNavMenu} 
        setShowNavMenu={setShowNavMenu} 
        menuRef={menuRef} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        isAdmin={isAdmin}
      />
            
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className="toast-card">
            <span className="toast-icon">[+]</span>
            <span className="toast-text">{n.message}</span> 
          </div>
        ))}
      </div>

      {isMaintenance && (
  <div style={{
    background: '#1A1A1A', // Negro profundo
    color: '#D7CCC8',    // Crema/Dorado suave
    textAlign: 'center',
    padding: '12px',
    fontFamily: 'Playfair Display, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 9999,
    borderBottom: '1px solid #8E735B'
  }}>
    AVISO: LA TIENDA SE ENCUENTRA EN MANTENIMIENTO TEMPORAL
  </div>
)}

      <Routes>
  {/* LANDING: Para bloquear los botones de la página principal */}
  <Route 
    path="/" 
    element={<LandingPage products={products} loading={loading} addToCart={addToCart} cart={cart} isMaintenance={isMaintenance} />} 
  />

  {/* EXPLORAR: Para bloquear los botones en la lista completa */}
  <Route 
    path="/explorar" 
    element={<ExplorarPage products={products} addToCart={addToCart} cart={cart} isMaintenance={isMaintenance} />} 
  />

  {/* DETALLE: Para que no puedan comprar desde adentro del producto */}
  <Route 
    path="/producto/:id" 
    element={<ProductDetail products={products} addToCart={addToCart} isMaintenance={isMaintenance} />} 
  />

  <Route 
    path="/buscar" 
    element={<SearchPage products={products} searchTerm={searchTerm} addToCart={addToCart} isMaintenance={isMaintenance} />} 
  />

  <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />

  <Route 
    path="/checkout" 
    element={
      <CheckoutPage 
        cart={cart} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart} 
        fetchProducts={fetchProducts} 
        isMaintenance={isMaintenance}
      />
    } 
  />
  
  <Route path="/success" element={<SuccessPage />} />
  {/* Solo una ruta de admin y protegida */}
<Route 
  path="/admin" 
  element={<AdminPanel products={products} isMaintenance={isMaintenance} setIsMaintenance={setIsMaintenance} />} 
/>
</Routes>

      <Footer />

      <div className="wa-container-floating">
  <span className="wa-tooltip"></span>
  <a 
    href="https://wa.me/5493794123456?text=Hola!%20Necesito%20información%20sobre%20un%20producto" 
    className="whatsapp-float" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  </a>
</div>
    </div>
  );
}