import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/', { replace: true });
    } else {
      setError('Ingresa email y contraseña');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box card">
        <div className="sidebar-logo" style={{ border: 'none', paddingTop: 0, marginBottom: '1.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            <span>FIT</span> <span>HOUSE</span>
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p style={{ color: '#ef5350', marginBottom: '0.75rem', fontSize: '0.8rem' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', marginTop: '0.25rem' }}>Entrar</button>
        </form>
      </div>
    </div>
  );
}
