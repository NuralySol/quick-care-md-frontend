import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';  // Assuming you have an API utility for making requests

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login({ username, password });

            // Store tokens in local storage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            // Check user role and navigate to the appropriate dashboard
            const role = response.data.role;  // Get role from response

            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'doctor') {
                navigate('/doctor/dashboard');
            } else if (role === 'superuser') {
                // Handle superusers
                navigate('/superuser/dashboard');  // Or wherever your superuser dashboard is
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
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;