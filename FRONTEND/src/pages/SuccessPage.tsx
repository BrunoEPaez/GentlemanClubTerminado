import { Link } from 'react-router-dom';
import '../SuccessPage.css'; // Asegúrate de crear este CSS

const SuccessPage = () => {
  return (
    <div className="success-container">
      <div className="success-glass">
        <div className="mission-header">
          <span className="blink">[!] SISTEMA ACTUALIZADO</span>
          <h1 className="glitch-text">MISIÓN CUMPLIDA</h1>
        </div>
        
        <div className="success-body">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          
          <p className="success-message">
            Tu pedido ha sido procesado con éxito en el núcleo del sistema.
          </p>
          
          <div className="wa-alert">
            <span className="wa-icon">➔</span>
            REVISÁ TU EMAIL PARA LA CONFIRMACIÓN DE ENVÍO
          </div>
        </div>

        <div className="success-footer">
          <Link to="/" className="buy-button success-btn">
            VOLVER AL HUB PRINCIPAL
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;