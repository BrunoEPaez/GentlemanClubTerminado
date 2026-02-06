import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../ExplorarPage.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ExplorarPage = ({ products, addToCart, cart, isMaintenance, loading }: any) => {
  const location = useLocation(); 
  const [category, setCategory] = useState('TODOS');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('categoria') || 'TODOS';
    setCategory(categoryFromUrl.toUpperCase());
    setPage(1);
  }, [location.search]);

  // --- 1. ORDENAR POR DEFECTO (Nuevos primero) ---
  // Hacemos una copia y revertimos para que el último ID aparezca primero
  let baseProducts = products ? [...products].reverse() : [];

  // --- 2. FILTRADO ---
  let filtered = baseProducts.filter((p: any) => {
    const productCat = p.category ? p.category.toUpperCase() : "";
    if (category === 'TODOS') return true;
    if (category === 'OFERTAS') return p.on_sale === true;
    return productCat === category;
  });
  
  // --- 3. ORDENAMIENTO POR PRECIO ---
  if (sort === 'low') {
    filtered.sort((a: any, b: any) => {
      const pA = a.on_sale ? (a.price * (1 - a.discount_percentage / 100)) : a.price;
      const pB = b.on_sale ? (b.price * (1 - b.discount_percentage / 100)) : b.price;
      return pA - pB;
    });
  }
  if (sort === 'high') {
    filtered.sort((a: any, b: any) => {
      const pA = a.on_sale ? (a.price * (1 - a.discount_percentage / 100)) : a.price;
      const pB = b.on_sale ? (b.price * (1 - b.discount_percentage / 100)) : b.price;
      return pB - pA;
    });
  }

  const displayProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="explore-layout" style={{ backgroundColor: '#F4F1ED', minHeight: '100vh' }}>
      <aside className="filters-sidebar">
        <div className="filter-group">
          <label className="sidebar-title">COLECCIONES</label>
          <div className="filter-buttons-container">
            {['TODOS', 'OFERTAS', 'SASTRERIA', 'CALZADO', 'ACCESORIOS'].map(cat => (
              <button 
                key={cat} 
                className={category === cat ? 'active' : ''} 
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label className="sidebar-title">ORDENAR POR</label>
          <select onChange={(e) => setSort(e.target.value)} className="gentleman-select">
            <option value="default">RELEVANCIA (NUEVOS)</option>
            <option value="low">MENOR PRECIO</option>
            <option value="high">MAYOR PRECIO</option>
          </select>
        </div>
      </aside>

      <div className="main-content">
        <div className="items-grid">
          {loading ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic' }}>CARGANDO COLECCIÓN...</p>
             </div>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((p: any) => {
              const discount = p.discount_percentage || 0;
              const finalPrice = p.on_sale ? p.price - (p.price * discount / 100) : p.price;
              const itemEnCarrito = cart?.find((item: any) => item.id === p.id);
              const sinStockReal = Number(p.stock) <= 0;
              const limiteAlcanzado = itemEnCarrito && itemEnCarrito.quantity >= p.stock;

              return (
                <div key={p.id} className="product-card-gentleman">
                  <Link to={`/producto/${p.id}`} className="image-wrapper" style={{ position: 'relative', display: 'block' }}>
                    <img 
                      src={p.image ? `${API_URL}${p.image}` : 'https://via.placeholder.com/300'} 
                      alt={p.name} 
                    />
                    {/* CARTELITO DE OFERTA AÑADIDO (Igual a LandingPage) */}
                    {p.on_sale && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: '#8E735B', 
                        color: 'white', 
                        padding: '5px 12px', 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        letterSpacing: '1px',
                        zIndex: 2
                      }}>
                        OFERTA
                      </span>
                    )}
                  </Link>

                  <div className="product-info" style={{ textAlign: 'center', padding: '20px' }}>
                    <span style={{ color: '#8E735B', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {p.category || 'COLECCIÓN'}
                    </span>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', textTransform: 'uppercase', letterSpacing: '1px', margin: '10px 0' }}>
                      {p.name}
                    </h3>
                    
                    <div className="price-container-gentleman" style={{ marginBottom: '15px' }}>
                      {p.on_sale ? (
                        <>
                          <span className="old-price" style={{ color: '#999', textDecoration: 'line-through', marginRight: '10px' }}>${p.price.toLocaleString()}</span>
                          <span className="current-price" style={{ fontWeight: 'bold', color: '#1A1A1A', fontSize: '1.2rem' }}>
                            ${finalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="current-price" style={{ fontWeight: 'bold', color: '#1A1A1A', fontSize: '1.2rem' }}>${p.price.toLocaleString()}</span>
                      )}
                    </div>

                    <button 
                      className="add-btn" 
                      onClick={() => !limiteAlcanzado && addToCart(p)}
                      disabled={sinStockReal || limiteAlcanzado || isMaintenance} 
                      style={{
                        background: (sinStockReal || limiteAlcanzado || isMaintenance) ? '#EEE' : '#1A1A1A',
                        color: (sinStockReal || limiteAlcanzado || isMaintenance) ? '#999' : 'white',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isMaintenance ? 'PAUSADO' : sinStockReal ? 'AGOTADO' : limiteAlcanzado ? 'EN CARRITO' : 'AÑADIR AL CARRITO'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: '100px' }}>
              <h2 style={{ fontFamily: 'Playfair Display', color: '#1A1A1A' }}>NO SE ENCONTRARON ARTÍCULOS</h2>
            </div>
          )}
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '60px', paddingBottom: '80px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #D7CCC8', paddingTop: '40px' }}>
            <button 
              className="nav-btn"
              disabled={page === 1} 
              onClick={() => { setPage(page - 1); window.scrollTo(0,0); }} 
              style={{
                border: '1px solid #1A1A1A', 
                color: page === 1 ? '#CCC' : '#1A1A1A', 
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
              className="nav-btn"
              disabled={page >= totalPages} 
              onClick={() => { setPage(page + 1); window.scrollTo(0,0); }} 
              style={{
                border: '1px solid #1A1A1A', 
                color: page >= totalPages ? '#CCC' : '#1A1A1A', 
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
    </div>
  );
};

export default ExplorarPage;