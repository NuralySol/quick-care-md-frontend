import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { login } from '../api';
import { jwtDecode } from 'jwt-decode';
import styles from './Login.module.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login({ username, password });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
    
            const decodedToken = jwtDecode(response.data.access);
    
            const role = decodedToken.role;
    
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'doctor') {
                navigate(`/doctor/dashboard/${decodedToken.user_id}`);
            } else {
                alert('Unknown role');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleLogin}>
                <h2>Login</h2>
                <div className={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button className={styles.loginButton} type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* Go to Home button */}
                <Link to="/" className={styles.homeButton}>
                    Go to Home
                </Link>
            </form>
        </div>
    );
};

export default Login;