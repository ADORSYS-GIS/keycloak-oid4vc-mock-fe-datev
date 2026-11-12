import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1F3D52',
        color: '#fff',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}datev.png`}
        alt="Datev logo"
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          width: '140px',
          height: '140px',
          objectFit: 'contain',
          marginBottom: '24px',
        }}
      />
      <div
        style={{
          width: 'min(100%, 560px)',
          padding: '36px',
          borderRadius: '8px',
          backgroundColor: 'rgba(20, 34, 44, 0.72)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: '2rem', color: '#fff' }}>
          Choose how to continue
        </h1>
        <p style={{ margin: '0 0 28px', color: '#d1d5db', lineHeight: 1.5 }}>
          Choose whether to get a new credential or sign in with a credential you already have.
        </p>
        <div style={{ display: 'grid', gap: '14px' }}>
          <button
            onClick={() => login('credential-issuer')}
            style={choiceButtonStyle}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#9adb3c')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#AAE651')}
          >
            <span style={{ display: 'block', fontSize: '1rem' }}>Get a credential</span>
            <span style={choiceDescriptionStyle}>
              Sign in with your Keycloak username and password, then create a credential offer for
              your wallet
            </span>
          </button>
          <button
            onClick={() => login('keycloak-credential')}
            style={{
              ...choiceButtonStyle,
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid #78909c',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ display: 'block', fontSize: '1rem' }}>
              Sign in with a Keycloak credential
            </span>
            <span style={{ ...choiceDescriptionStyle, color: '#d1d5db' }}>
              Continue to Keycloak and choose the Keycloak credential sign-in option
            </span>
          </button>
          <button
            onClick={() => login('german-pid')}
            style={{
              ...choiceButtonStyle,
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid #78909c',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ display: 'block', fontSize: '1rem' }}>Sign in with a German wallet</span>
            <span style={{ ...choiceDescriptionStyle, color: '#d1d5db' }}>
              Continue to Keycloak and choose German PID, then scan its QR code
            </span>
          </button>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#d1d5db',
          fontSize: '13px',
          opacity: 0.85,
        }}
      >
        {/* Info icon */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#e5e7eb',
          }}
        >
          i
        </div>

        {/* Text */}
        <div
          style={{
            fontWeight: 700,
            lineHeight: '1.3',
          }}
        >
          <div>This is an experimental playground.</div>
          <div>Made solely for demo purposes.</div>
        </div>
      </div>
    </div>
  );
};

const choiceButtonStyle: React.CSSProperties = {
  padding: '14px 18px',
  backgroundColor: '#AAE651',
  color: '#000',
  border: '1px solid #9adb3c',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 700,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
};

const choiceDescriptionStyle: React.CSSProperties = {
  display: 'block',
  marginTop: '5px',
  fontSize: '0.82rem',
  fontWeight: 400,
};

export default Login;
