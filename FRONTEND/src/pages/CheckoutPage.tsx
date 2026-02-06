import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = ({ cart, removeFromCart, clearCart, fetchProducts }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const total = cart.reduce((acc: number, item: any) => {
    const basePrice = Number(item.price) || 0;
    const discount = Number(item.discount_percentage) || 0;
    const precioFinal = item.on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
    return acc + (precioFinal * (item.quantity || 1));
  }, 0);

  const procesarCompra = async (metodo: 'MP' | 'WA') => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/checkout`, {
        items: cart.map((item: any) => ({
          id: item.id,
          quantity: item.quantity || 1
        })),
        metodo: metodo
      });

      if (response.status === 200) {
        alert("✅ ¡TRANSACCIÓN COMPLETADA! El stock ha sido actualizado.");
        clearCart();
        if (fetchProducts) fetchProducts();
        navigate('/');
      }
    } catch (error: any) {
      console.error("Error en la compra:", error);
      alert(error.response?.data?.error || "Error crítico en la sincronización de stock");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container" style={{textAlign: 'center', padding: '150px 20px', minHeight: '100vh', background: '#F4F1ED'}}>
        <h2 style={{ fontFamily: 'Playfair Display', color: '#1A1A1A', fontSize: '2.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
          TU CARRITO ESTÁ VACÍO
        </h2>
        <p style={{color: '#8E735B', marginTop: '10px', fontFamily: 'Inter', letterSpacing: '1px'}}>
          NO HAY ARTÍCULOS SELECCIONADOS EN TU COLECCIÓN
        </p>
        <Link 
          to="/explorar" 
          style={{
            display: 'inline-block', 
            marginTop: '30px', 
            padding: '15px 40px', 
            background: '#1A1A1A', 
            color: 'white', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontFamily: 'Inter',
            letterSpacing: '2px',
            fontSize: '12px'
          }}
        >
          VOLVER A LA TIENDA
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container" style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: '100vh', background: '#F4F1ED' }}>
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* COLUMNA IZQUIERDA: RESUMEN */}
        <div style={{ padding: '30px', background: 'white', border: '1px solid #D7CCC8' }}>
          <h2 style={{ fontFamily: 'Playfair Display', color: '#1A1A1A', marginBottom: '30px', borderBottom: '1px solid #D7CCC8', paddingBottom: '10px', fontSize: '1.5rem' }}>
            RESUMEN DE PEDIDO
          </h2>
          <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map((item: any) => {
               const basePrice = Number(item.price) || 0;
               const discount = Number(item.discount_percentage) || 0;
               const precioUnitario = item.on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
               const imageSrc = item.image?.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`;

               return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ width: '80px', height: '100px', overflow: 'hidden', background: '#F9F9F9' }}>
                    <img 
                      src={imageSrc} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => { e.target.src = "https://via.placeholder.com/80x100?text=Item"; }} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontFamily: 'Playfair Display', color: '#1A1A1A', textTransform: 'uppercase', margin: '0 0 5px 0' }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#8E735B', fontFamily: 'Inter' }}>{item.quantity} x ${precioUnitario.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#999' }}
                  >
                    QUITAR
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '30px', padding: '20px 0', borderTop: '2px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL:</span>
            <span style={{ fontSize: '24px', fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#1A1A1A' }}>
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* COLUMNA DERECHA: PAGO */}
        <div style={{ padding: '40px', background: '#1A1A1A', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '25px' }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', letterSpacing: '2px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            FINALIZAR COMPRA
          </h2>
          
          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic' }}>Procesando solicitud...</p>
            </div>
          ) : (
            <>
              <p style={{ color: '#AAA', fontSize: '12px', letterSpacing: '1px', fontFamily: 'Inter' }}>ELIJA SU MÉTODO DE PAGO</p>
              
              <button 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #8E735B', 
                  padding: '20px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  color: 'white',
                  transition: '0.3s'
                }} 
                onClick={() => procesarCompra('MP')}
                onMouseOver={(e) => e.currentTarget.style.background = '#222'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '2px', fontFamily: 'Inter' }}>MERCADO PAGO</div>
                <div style={{ fontSize: '10px', color: '#8E735B', textTransform: 'uppercase', fontFamily: 'Inter' }}>
                  Tarjetas de crédito, débito y efectivo
                </div>
              </button>

              <button 
                style={{ 
                  background: '#8E735B', 
                  border: 'none', 
                  padding: '20px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  color: 'white',
                  transition: '0.3s'
                }} 
                onClick={() => procesarCompra('WA')}
                onMouseOver={(e) => e.currentTarget.style.background = '#7a624d'}
                onMouseOut={(e) => e.currentTarget.style.background = '#8E735B'}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '2px', fontFamily: 'Inter' }}>WHATSAPP BUSINESS</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontFamily: 'Inter' }}>
                  Acordar pago y envío con un asesor
                </div>
              </button>

              <div style={{ marginTop: 'auto', fontSize: '10px', color: '#555', fontFamily: 'Inter', textAlign: 'center', letterSpacing: '1px' }}>
                TRANSACCIÓN SEGURA SSL | THE GENTLEMAN ©
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;