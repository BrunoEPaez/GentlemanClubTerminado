import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const LandingPage = ({ products, loading, addToCart, cart, isMaintenance }: any) => {
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // --- 1. ORDENAR POR DEFECTO (Nuevos primero) ---
  // Hacemos una copia y revertimos para que el último producto en el array aparezca primero.
  const baseProducts = products ? [...products].reverse() : [];

  // --- 2. LÓGICA DE FILTRADO SOBRE EL ARRAY REVERTIDO ---
  const filtered = baseProducts.filter((p: any) => {
    const filtro = categoryFilter.toUpperCase();
    if (filtro === 'TODOS') return true;
    if (filtro === 'OFERTAS') return p.on_sale === true;

    if (filtro === 'NUEVOS PRODUCTOS') {
      if (p.created_at) {
        const fechaCreacion = new Date(p.created_at).getTime();
        const fechaActual = new Date().getTime();
        const diasConfigurados = p.new_until_days || 7; 
        const duracionMilisegundos = diasConfigurados * 24 * 60 * 60 * 1000;
        if (!isNaN(fechaCreacion) && (fechaActual - fechaCreacion) < duracionMilisegundos) {
          return true;
        }
      }
      // Si no hay fecha, mostramos los últimos 8 por ID
      const maxId = Math.max(...products.map((prod: any) => prod.id), 0);
      return p.id > (maxId - 8);
    }
    return p.category?.toUpperCase() === filtro;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const changeFilter = (cat: string) => {
    setCategoryFilter(cat);
    setPage(1);
  };

  return (
    <main className="main-scrollable" style={{ backgroundColor: '#F4F1ED', paddingTop: '100px', minHeight: '100vh' }}>
      <div className="content-wrapper">
        
        <header className="hero-section" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontSize: '3.5rem', 
            color: '#1A1A1A', 
            letterSpacing: '4px', 
            fontWeight: '700', 
            margin: '0', 
            textTransform: 'uppercase' 
          }}>
            The Gentleman's Collection
          </h1>
          <p style={{ 
            color: '#8E735B', 
            letterSpacing: '3px', 
            fontSize: '0.9rem', 
            marginTop: '15px', 
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif'
          }}>
            ESTILO URBANO & SASTRERÍA DE ALTA GAMA
          </p>
        </header>

        {/* BOTONES DE FILTRO ESTILO GENTLEMAN */}
        <div style={{ display: 'flex', gap: '15px', padding: '15px', marginBottom: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['TODOS', 'OFERTAS', 'NUEVOS PRODUCTOS'].map(cat => (
            <button 
              key={cat} 
              onClick={() => changeFilter(cat)}
              style={{
                background: categoryFilter === cat ? '#1A1A1A' : 'transparent',
                color: categoryFilter === cat ? '#FFF' : '#1A1A1A',
                border: '1px solid #1A1A1A',
                padding: '12px 25px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '2px',
                fontWeight: '600',
                transition: '0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="items-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '40px', 
          padding: '0 20px',
          width: '100%',
          maxWidth: '1200px'
        }}>
          {loading ? (
            <h2 style={{ color: '#1A1A1A', fontFamily: 'Playfair Display', textAlign: 'center', gridColumn: '1/-1' }}>CARGANDO COLECCIÓN...</h2>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((p: any) => {
              const discount = p.discount_percentage || 0;
              const finalPrice = p.on_sale ? p.price - (p.price * discount / 100) : p.price;
              const itemEnCarrito = cart?.find((item: any) => item.id === p.id);
              const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0;
              const sinStockReal = p.stock <= 0;
              const limiteAlcanzado = cantidadEnCarrito >= p.stock;

              return (
                <div key={p.id} style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #D7CCC8', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease'
                }}>
                  <Link to={`/producto/${p.id}`} style={{ display: 'block', height: '350px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={p.image ? `${API_URL}${p.image}` : 'https://via.placeholder.com/300'} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {p.on_sale && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#8E735B', color: 'white', padding: '5px 12px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>OFERTA</span>
                    )}
                  </Link>
                  
                  <div style={{ padding: '20px', flexGrow: 1, textAlign: 'center' }}>
                    <span style={{ color: '#8E735B', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>{p.category?.toUpperCase() || 'COLECCIÓN'}</span>
                    <h3 style={{ 
                      color: '#1A1A1A', 
                      fontFamily: 'Playfair Display, serif', 
                      fontSize: '1.2rem', 
                      margin: '10px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>{p.name}</h3>
                    
                    <div style={{ marginTop: '10px' }}>
                       <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1A1A1A' }}>${finalPrice.toLocaleString()}</span>
                       {p.on_sale && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem', marginLeft: '10px' }}>${p.price.toLocaleString()}</span>}
                    </div>
                  </div>

                  <button 
                    onClick={() => !limiteAlcanzado && addToCart(p)}
                    disabled={sinStockReal || limiteAlcanzado || isMaintenance}
                    style={{
                      background: (sinStockReal || limiteAlcanzado || isMaintenance) ? '#EEE' : '#1A1A1A',
                      color: (sinStockReal || limiteAlcanzado || isMaintenance) ? '#999' : 'white',
                      fontFamily: 'Playfair Display, serif',
                      width: '100%',
                      border: 'none',
                      height: '55px',
                      cursor: (sinStockReal || limiteAlcanzado || isMaintenance) ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!sinStockReal && !limiteAlcanzado && !isMaintenance) e.currentTarget.style.background = '#8E735B';
                    }}
                    onMouseOut={(e) => {
                      if (!sinStockReal && !limiteAlcanzado && !isMaintenance) e.currentTarget.style.background = '#1A1A1A';
                    }}
                  >
                    {isMaintenance ? 'PAUSADO' : sinStockReal ? 'AGOTADO' : limiteAlcanzado ? 'EN CARRITO' : 'AÑADIR AL CARRITO'}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{textAlign: 'center', gridColumn: '1/-1', marginTop: '50px'}}>
              <h2 style={{ color: '#1A1A1A', fontFamily: 'Playfair Display' }}>SIN ARTÍCULOS EN ESTA CATEGORÍA</h2>
            </div>
          )}
        </div>

        {/* PAGINACIÓN */}
        {!loading && totalPages > 1 && (
          <div style={{ marginTop: '60px', paddingBottom: '80px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
            <button 
              disabled={page === 1} 
              onClick={() => { setPage(page - 1); window.scrollTo(0,0); }} 
              style={{
                border: '1px solid #1A1A1A', 
                color: '#1A1A1A', 
                padding: '10px 30px', 
                background: 'transparent', 
                cursor: 'pointer', 
                fontFamily: 'Inter',
                fontSize: '12px',
                letterSpacing: '1px',
                opacity: page === 1 ? 0.3 : 1
              }}
            >
              ATRÁS
            </button>
            <span style={{fontFamily: 'Playfair Display', fontSize: '18px', color: '#1A1A1A', fontStyle: 'italic'}}>{page} / {totalPages}</span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => { setPage(page + 1); window.scrollTo(0,0); }} 
              style={{
                border: '1px solid #1A1A1A', 
                color: '#1A1A1A', 
                padding: '10px 30px', 
                background: 'transparent', 
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '12px',
                letterSpacing: '1px',
                opacity: page >= totalPages ? 0.3 : 1
              }}
            >
              SIGUIENTE
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default LandingPage;