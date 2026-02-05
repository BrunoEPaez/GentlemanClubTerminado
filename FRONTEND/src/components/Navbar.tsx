import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ setShowNavMenu, showNavMenu, menuRef, cartCount, onSearch, searchTerm }: any) => {
  const navigate = useNavigate();
  
  const userJson = localStorage.getItem('gentleman-user');
  
  let user = null;
  if (userJson && userJson !== "undefined") {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      console.error("Error parseando usuario", e);
    }
  }

  // Ahora solo comprobamos si existe un usuario (está logueado)
  const isLoggedIn = user !== null;

  const handleLogout = () => {
    localStorage.removeItem('gentleman-user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="top-nav" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
      borderBottom: '1px solid #D7CCC8',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000
    }}>
      <div className="nav-container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        
        {/* LOGO */}
        <div className="nav-left-section" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link to="/" className="nav-logo" style={{ 
            fontFamily: 'serif', 
            fontSize: '1.5rem',
            letterSpacing: '4px', 
            color: '#1A1A1A',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            GENTLEMAN'S<span style={{ color: '#8E735B' }}>CLUB</span>
          </Link>
          
          <div className="nav-dropdown-wrapper" ref={menuRef} style={{ position: 'relative' }}>
            <button 
              className="nav-explore-btn" 
              onClick={() => setShowNavMenu(!showNavMenu)}
              style={{ color: '#1A1A1A', fontFamily: 'serif', letterSpacing: '2px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              COLECCIONES ▾
            </button>
            {showNavMenu && (
              <div className="nav-mega-menu" style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #D7CCC8', padding: '15px', minWidth: '200px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', borderRadius: '0' }}>
                <Link to="/explorar?categoria=SASTRERIA" className="menu-category-item" style={{ display: 'block', padding: '8px 0', color: '#1A1A1A', textDecoration: 'none', fontFamily: 'serif' }} onClick={() => setShowNavMenu(false)}>SASTRERÍA</Link>
                <Link to="/explorar?categoria=CALZADO" className="menu-category-item" style={{ display: 'block', padding: '8px 0', color: '#1A1A1A', textDecoration: 'none', fontFamily: 'serif' }} onClick={() => setShowNavMenu(false)}>CALZADO</Link>
                <Link to="/explorar?categoria=ACCESORIOS" className="menu-category-item" style={{ display: 'block', padding: '8px 0', color: '#1A1A1A', textDecoration: 'none', fontFamily: 'serif' }} onClick={() => setShowNavMenu(false)}>ACCESORIOS</Link>
                <div style={{ height: '1px', background: '#D7CCC8', margin: '10px 0' }}></div>
                <Link to="/explorar?categoria=TODOS" className="menu-category-item special" style={{ display: 'block', color: '#8E735B', textDecoration: 'none', fontWeight: 'bold' }} onClick={() => setShowNavMenu(false)}>VER TODO</Link>
              </div>
            )}
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="nav-search-container" style={{ flex: 1, margin: '0 40px' }}>
          <input 
            type="text" 
            placeholder="BUSCAR EN LA COLECCIÓN..." 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px 15px',
              backgroundColor: '#F4F1ED', 
              border: '1px solid #D7CCC8', 
              color: '#1A1A1A',
              fontFamily: 'serif',
              fontSize: '12px',
              letterSpacing: '1px'
            }}
          />
        </div>

        {/* ACCIONES */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* AHORA EL PANEL ES VISIBLE PARA CUALQUIER USUARIO LOGUEADO */}
          {isLoggedIn && (
            <Link to="/admin" style={{ 
              color: '#8E735B', 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              fontSize: '12px', 
              letterSpacing: '1px',
              border: '1px solid #8E735B',
              padding: '5px 10px'
            }}>
              PANEL
            </Link>
          )}
          
          <Link to="/checkout" style={{ color: '#1A1A1A', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span style={{ position: 'absolute', top: '-8px', right: '-12px', backgroundColor: '#1A1A1A', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '9px', fontFamily: 'sans-serif' }}>{cartCount}</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ 
                fontFamily: 'serif', 
                fontSize: '11px', 
                color: '#8E735B', 
                letterSpacing: '1px',
                borderRight: '1px solid #D7CCC8',
                paddingRight: '15px',
                textTransform: 'lowercase' 
              }}>
                {user.email}
              </span>
              
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #1A1A1A', padding: '6px 15px', cursor: 'pointer', fontFamily: 'serif', fontSize: '11px', letterSpacing: '1px' }}>
                SALIR
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link to="/auth?mode=login" style={{ color: '#1A1A1A', textDecoration: 'none', fontFamily: 'serif', fontSize: '12px', letterSpacing: '1px' }}>INGRESAR</Link>
              <Link to="/auth?mode=register" style={{ 
                backgroundColor: '#1A1A1A', 
                color: 'white', 
                padding: '8px 15px', 
                textDecoration: 'none', 
                fontFamily: 'serif', 
                fontSize: '11px', 
                letterSpacing: '1px' 
              }}>REGISTRARSE</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;