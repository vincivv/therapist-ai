import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
    return strong.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/dashboard'); // auto-login happens via the cookie
    } else {
      setError(data.error || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSignup}>
        <h2>Create Account</h2>

        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="toggle">
          <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
          Show password
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit">Sign Up</button>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>

      <style jsx>{`
        .signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
          padding: 1rem;
        }

        .signup-box {
          animation: fadeIn 0.6s ease;
          display: flex;
          flex-direction: column;
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .signup-box h2 {
          margin-bottom: 1.5rem;
        }

        .signup-box input {
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

        .signup-box button {
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .signup-box button:hover {
          background-color: #0055c1;
        }

        .signup-box p {
          margin-top: 1rem;
          text-align: center;
        }

        .signup-box a {
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
      `}</style>
    </div>
  );
}
