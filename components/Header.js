import useUser from '../lib/useUser';
import { useRouter } from 'next/router';

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/'); // Redirect to main page after logout
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Therapy Coach AI</h1>

      <div style={styles.authButtons}>
        {user ? (
          <button onClick={handleLogout} style={{ ...styles.button, backgroundColor: '#f44336' }}>
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push('/loginPage')}
              style={styles.button}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{ ...styles.button, marginLeft: '0.5rem', backgroundColor: '#6c63ff' }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: '#f8f9fa',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#9b59b6',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
};
