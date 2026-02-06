import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ products, isMaintenance, setIsMaintenance }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const [salesPage, setSalesPage] = useState(1);
  const salesPerPage = 10;

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [sales, setSales] = useState<any[]>([]);
  
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: 'SASTRERIA',
    secondary_category: '',
    on_sale: false,
    discount_percentage: 0,
    new_until_days: 7 
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);

  const categoriasDisponibles = ['SASTRERIA', 'CALZADO', 'ACCESORIOS'];

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sales`);
      setSales(res.data || []);
    } catch (e) {
      console.error("Error cargando ventas", e);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);
  
  const prepareEdit = (p: any) => {
    setIsEditing(true);
    setEditingId(p.id);
    setProductData({
      name: p.name,
      price: p.price,
      stock: p.stock || 0,
      description: p.description || '',
      category: p.category ? p.category.toUpperCase() : 'SASTRERIA',
      secondary_category: p.secondary_category || '',
      on_sale: p.on_sale || false,
      discount_percentage: p.discount_percentage || p.discount || 0,
      new_until_days: p.new_until_days || 7
    });
    // Limpiamos los inputs de archivos al empezar a editar
    setMainImage(null);
    setGalleryImages(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductData({ 
      name: '', price: '', stock: '', description: '', 
      category: 'SASTRERIA', secondary_category: '', 
      on_sale: false, discount_percentage: 0, new_until_days: 7 
    });
    setMainImage(null);
    setGalleryImages(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Agregamos datos básicos
    formData.append('name', productData.name);
    formData.append('price', String(productData.price));
    formData.append('stock', String(productData.stock));
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('secondary_category', productData.secondary_category);
    formData.append('on_sale', String(productData.on_sale));
    formData.append('discount_percentage', String(productData.discount_percentage));
    formData.append('new_until_days', String(productData.new_until_days));

    // Imagen principal
    if (mainImage) {
      formData.append('image', mainImage);
    }

    // --- CORRECCIÓN CLAVE PARA LA GALERÍA ---
    if (galleryImages && galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        // Usamos 'gallery[]' para que Go lo detecte como un array de archivos
        formData.append('gallery[]', galleryImages[i]);
      }
    }

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEditing && editingId) {
        await axios.put(`${API_URL}/api/products/${editingId}`, formData, config);
        alert("PRODUCTO ACTUALIZADO");
      } else {
        await axios.post(`${API_URL}/api/products`, formData, config);
        alert("PRODUCTO CREADO");
      }
      window.location.reload();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    }
  };
  const toggleMaintenance = async () => {
    const nuevoEstado = !isMaintenance;
    try {
      await axios.post(`${API_URL}/api/settings/maintenance`, { value: nuevoEstado });
      setIsMaintenance(nuevoEstado);
    } catch (e) {
      alert("Error al cambiar modo mantenimiento");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿ELIMINAR PRODUCTO?")) {
      try {
        await axios.delete(`${API_URL}/api/products/${id}`);
        window.location.reload();
      } catch (error) {
        alert("ERROR AL ELIMINAR");
      }
    }
  };

  const sortedProducts = [...products].sort((a: any, b: any) => b.id - a.id);
  const filteredProducts = sortedProducts.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString() === searchTerm
  );
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfLastProduct - productsPerPage, indexOfLastProduct);
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);

  const indexOfLastSale = salesPage * salesPerPage;
  const currentSales = sales.slice(indexOfLastSale - salesPerPage, indexOfLastSale);
  const totalSalesPages = Math.ceil(sales.length / salesPerPage);

  return (
    <div className="admin-container" style={{ backgroundColor: '#F4F1ED', paddingTop: '140px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #D7CCC8', paddingBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1A1A1A' }}>PANEL DE ADMINISTRACIÓN</h2>
          <input 
            type="text" 
            placeholder="BUSCAR PRODUCTO..." 
            style={{ padding: '10px', width: '300px', border: '1px solid #D7CCC8', fontFamily: 'Inter' }}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '40px', marginBottom: '60px', border: '1px solid #D7CCC8', display: 'grid', gap: '25px', gridTemplateColumns: '1fr 1fr' }}>
          <h3 style={{ gridColumn: 'span 2', fontFamily: 'Playfair Display', borderBottom: '1px solid #F4F1ED', paddingBottom: '10px' }}>
            {isEditing ? `EDITANDO: ${productData.name}` : 'AÑADIR NUEVO ARTÍCULO'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>NOMBRE DEL PRODUCTO</label>
            <input type="text" value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} style={{ padding: '12px', border: '1px solid #D7CCC8' }} required />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '30px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>CATEGORÍA PRINCIPAL</label>
            <select value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})} style={{ padding: '12px', border: '1px solid #D7CCC8', background: 'white' }}>
              {categoriasDisponibles.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>PRECIO ($)</label>
            <input type="number" value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} style={{ padding: '12px', border: '1px solid #D7CCC8' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '30px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>STOCK DISPONIBLE</label>
            <input type="number" value={productData.stock} onChange={e => setProductData({...productData, stock: e.target.value})} style={{ padding: '12px', border: '1px solid #D7CCC8' }} required />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>ETIQUETA SECUNDARIA (EJ: HOMBRE / MUJER)</label>
            <input type="text" value={productData.secondary_category} onChange={e => setProductData({...productData, secondary_category: e.target.value.toUpperCase()})} style={{ padding: '12px', border: '1px solid #D7CCC8' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '30px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>DÍAS COMO "NUEVO"</label>
            <select value={productData.new_until_days} onChange={e => setProductData({...productData, new_until_days: parseInt(e.target.value)})} style={{ padding: '12px', border: '1px solid #D7CCC8', background: 'white' }}>
              {[1, 3, 7, 15, 30].map(d => <option key={d} value={d}>{d} DÍAS</option>)}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2', background: '#F9F9F9', padding: '20px', display: 'flex', alignItems: 'center', gap: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'Inter', fontSize: '14px' }}>
              <input type="checkbox" checked={productData.on_sale} onChange={e => setProductData({...productData, on_sale: e.target.checked})} /> ¿PRODUCTO EN OFERTA?
            </label>
            {productData.on_sale && (
              <input type="number" placeholder="% DESCUENTO" value={productData.discount_percentage} onChange={e => setProductData({...productData, discount_percentage: parseInt(e.target.value) || 0})} style={{ width: '150px', padding: '8px' }} />
            )}
          </div>

          <textarea placeholder="DESCRIPCIÓN DEL PRODUCTO..." style={{ gridColumn: 'span 2', minHeight: '100px', padding: '15px', border: '1px solid #D7CCC8', fontFamily: 'Inter' }} value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} />
          
          <div>
            <label style={{ fontSize: '11px', color: '#8E735B', display: 'block', marginBottom: '5px' }}>IMAGEN PRINCIPAL</label>
            <input type="file" onChange={e => setMainImage(e.target.files![0])} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8E735B', display: 'block', marginBottom: '5px' }}>GALERÍA DE IMÁGENES</label>
            <input type="file" multiple onChange={e => setGalleryImages(e.target.files)} />
          </div>
          
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button type="submit" style={{ flex: 2, background: '#1A1A1A', color: 'white', padding: '15px', border: 'none', fontFamily: 'Playfair Display', letterSpacing: '2px', cursor: 'pointer', fontSize: '14px' }}>
              {isEditing ? 'GUARDAR CAMBIOS' : 'PUBLICAR PRODUCTO'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} style={{ flex: 1, background: 'transparent', border: '1px solid #1A1A1A', padding: '15px', cursor: 'pointer' }}>
                CANCELAR
              </button>
            )}
          </div>
        </form>

        <div style={{ background: 'white', padding: '20px', border: '1px solid #D7CCC8', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #D7CCC8' }}>
                <th style={{ padding: '15px' }}>ID</th>
                <th>VISTA</th>
                <th>NOMBRE</th>
                <th>STOCK</th>
                <th>PRECIO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p: any) => {
                // Verificamos el valor real del descuento
                const dPercentage = p.discount_percentage || p.discount || 0;
                
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '15px', color: '#8E735B' }}>#{p.id}</td>
                    <td>
                      {p.image ? (
                        <img src={`${API_URL}${p.image}`} width="40" alt="" />
                      ) : (
                        <div style={{ width: 40, height: 40, background: '#ccc' }} />
                      )}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {p.name}
                      {p.on_sale && <span style={{ marginLeft: '10px', color: '#E53935', fontSize: '10px', border: '1px solid #E53935', padding: '2px 4px' }}>-{dPercentage}%</span>}
                    </td>
                    <td style={{ color: p.stock <= 3 ? 'red' : 'inherit' }}>{p.stock}</td>
                    <td>${p.price.toLocaleString()}</td>
                    <td>
                      <button onClick={() => prepareEdit(p)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: '1px solid #D7CCC8', padding: '5px 10px' }}>EDITAR</button>
                      <button onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer', color: 'red', background: 'none', border: '1px solid red', padding: '5px 10px' }}>BORRAR</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
            <span>Página {currentPage} de {totalProductPages || 1}</span>
            <button disabled={currentPage === totalProductPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
          </div>
        </div>

        {/* ... Resto del componente (Ventas y Mantenimiento) se mantiene igual ... */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ fontFamily: 'Playfair Display', borderBottom: '1px solid #D7CCC8', paddingBottom: '10px' }}>HISTORIAL DE VENTAS</h2>
          <div style={{ background: 'white', padding: '20px', border: '1px solid #D7CCC8', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #D7CCC8' }}>
                  <th style={{ padding: '12px' }}>FECHA</th>
                  <th>ID TRANSACCIÓN</th>
                  <th>DETALLE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {currentSales.length > 0 ? currentSales.map((sale: any) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #F4F1ED' }}>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(sale.created_at).toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', color: '#8E735B' }}>{sale.transaction_id}</td>
                    <td style={{ fontSize: '12px' }}>{sale.items_description}</td>
                    <td style={{ fontWeight: 'bold' }}>${Number(sale.total_price).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay ventas registradas</td></tr>
                )}
              </tbody>
            </table>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button disabled={salesPage === 1} onClick={() => setSalesPage(salesPage - 1)}>Anterior</button>
              <span>Página {salesPage} de {totalSalesPages || 1}</span>
              <button disabled={salesPage === totalSalesPages} onClick={() => setSalesPage(salesPage + 1)}>Siguiente</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '60px', padding: '30px', border: `2px solid ${isMaintenance ? '#8E735B' : '#2E7D32'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <div>
            <h4 style={{ margin: 0, fontFamily: 'Playfair Display' }}>ESTADO DE LA TIENDA: {isMaintenance ? 'EN PAUSA' : 'ACTIVA'}</h4>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Si activas la pausa, los clientes no podrán añadir productos al carrito.</p>
          </div>
          <button 
            onClick={toggleMaintenance}
            style={{ padding: '12px 25px', background: isMaintenance ? '#8E735B' : '#1A1A1A', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Inter', letterSpacing: '1px' }}
          >
            {isMaintenance ? 'REANUDAR VENTAS' : 'PAUSAR TIENDA POR VACACIONES'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;