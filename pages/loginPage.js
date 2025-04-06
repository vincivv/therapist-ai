import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/'); // Or your desired page
    } else {
      const data = await res.json();
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="toggle">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          Show password
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit">Login</button>
        <p>
          or <a href="/signup">Sign up</a>
        </p>
      </form>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
          padding: 1rem;
        }

        .login-box {
          animation: fadeIn 0.7s ease-in-out;
          display: flex;
          flex-direction: column;
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .login-box h2 {
          margin-bottom: 1.5rem;
        }

        .login-box input {
          margin-bottom: 1rem;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .toggle {
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .login-box button {
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .login-box button:hover {
          background-color: #0055c1;
        }

        .login-box p {
          margin-top: 1rem;
          text-align: center;
        }

        .login-box a {
          color: #0070f3;
        }

        .error-message {
          color: red;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 500px) {
          .login-box {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
