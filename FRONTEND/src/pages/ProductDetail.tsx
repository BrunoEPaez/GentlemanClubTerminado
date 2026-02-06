import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = ({ products, addToCart, isMaintenance }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Buscamos el producto en la lista que viene por props
  const product = products.find((p: any) => p.id === Number(id));

  // Estado para la imagen que se visualiza en grande
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  if (!product) {
    return (
      <div style={{ marginTop: '150px', textAlign: 'center', fontFamily: 'Playfair Display', color: '#1A1A1A' }}>
        PRODUCTO NO ENCONTRADO
      </div>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  
  // Imagen principal del producto
  const mainImg = product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/500';
  
  // Cálculos de precio
  const basePrice = Number(product.price) || 0;
  const discount = Number(product.discount_percentage) || 0;
  const finalPrice = product.on_sale ? basePrice - (basePrice * (discount / 100)) : basePrice;

  // La imagen actual a mostrar (si no hay una seleccionada, mostrar la principal)
  const currentImg = displayImage || mainImg;

  return (
    <div className="product-detail-container" style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '50px', background: '#F4F1ED' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '40px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px',
        background: '#fff',
        border: '1px solid #D7CCC8'
      }}>
        
        {/* LADO IZQUIERDO: VISUALES */}
        <div className="visual-sector">
          <div style={{ 
            border: '1px solid #D7CCC8', 
            marginBottom: '20px', 
            height: '500px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#fff',
            overflow: 'hidden'
          }}>
            <img 
              src={currentImg} 
              alt={product.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'all 0.3s ease' }} 
            />
          </div>
          
          {/* CAROUSEL DE MINIATURAS (GALERÍA REAL) */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', overflowX: 'auto', padding: '10px' }}>
            
            {/* Miniatura de la Imagen Principal */}
            <img 
              src={mainImg} 
              style={{ 
                width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer',
                border: currentImg === mainImg ? '2px solid #8E735B' : '1px solid #D7CCC8',
                borderRadius: '2px'
              }}
              onClick={() => setDisplayImage(mainImg)}
              alt="principal"
            />

            {/* Mapeo de la galería que viene de la DB (Array de objetos) */}
            {product.gallery && product.gallery.map((imgObj: any) => {
              const fullUrl = `${API_URL}${imgObj.url}`;
              return (
                <img 
                  key={imgObj.id}
                  src={fullUrl} 
                  style={{ 
                    width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer',
                    border: currentImg === fullUrl ? '2px solid #8E735B' : '1px solid #D7CCC8',
                    borderRadius: '2px'
                  }}
                  onClick={() => setDisplayImage(fullUrl)}
                  alt={`galeria-${imgObj.id}`}
                  onError={(e) => (e.currentTarget.style.display = 'none')} 
                />
              );
            })}
          </div>
        </div>

        {/* LADO DERECHO: INFO */}
        <div className="info-sector">
          <span style={{ color: '#8E735B', letterSpacing: '3px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {product.category?.toUpperCase()}
          </span>

          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: '15px 0', 
            fontFamily: 'Playfair Display, serif', 
            color: '#1A1A1A',
            textTransform: 'uppercase'
          }}>
            {product.name}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '30px' }}>
            <span style={{ color: '#1A1A1A', fontSize: '2.2rem', fontWeight: 'bold' }}>
              ${finalPrice.toLocaleString()}
            </span>
            {product.on_sale && (
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.2rem' }}>
                ${basePrice.toLocaleString()}
              </span>
            )}
          </div>

          <p style={{ 
            color: '#444', 
            lineHeight: '1.8', 
            marginBottom: '30px', 
            background: '#F9F7F5', 
            padding: '20px', 
            borderLeft: '3px solid #8E735B' 
          }}>
            {product.description || "Sin descripción disponible."}
          </p>

          <div style={{ marginBottom: '30px', borderTop: '1px solid #EEE', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#888' }}>DISPONIBILIDAD:</span>
              <span style={{ color: product.stock > 0 ? '#1A1A1A' : '#8E735B', fontWeight: 'bold' }}>
                {product.stock > 0 ? `${product.stock} UNIDADES` : 'AGOTADO'}
              </span>
            </div>
          </div>

          <button 
            style={{ 
              width: '100%', 
              padding: '20px', 
              fontSize: '1rem', 
              cursor: (product.stock <= 0 || isMaintenance) ? 'not-allowed' : 'pointer', 
              background: (product.stock <= 0 || isMaintenance) ? '#ccc' : '#1A1A1A', 
              color: 'white',
              border: 'none',
              fontFamily: 'Playfair Display, serif',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (product.stock > 0 && !isMaintenance) e.currentTarget.style.background = '#8E735B';
            }}
            onMouseOut={(e) => {
              if (product.stock > 0 && !isMaintenance) e.currentTarget.style.background = '#1A1A1A';
            }}
            disabled={product.stock <= 0 || isMaintenance}
            onClick={() => addToCart(product)}
          >
            {isMaintenance ? 'SISTEMA EN PAUSA' : product.stock > 0 ? 'AÑADIR AL CARRITO' : 'SIN STOCK'}
          </button>
          
          <button 
            style={{ background: 'none', border: 'none', color: '#888', marginTop: '30px', cursor: 'pointer', textDecoration: 'underline' }} 
            onClick={() => navigate(-1)}
          >
            VOLVER ATRÁS
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;