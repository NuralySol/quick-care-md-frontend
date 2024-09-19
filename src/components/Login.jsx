import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

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
            
            // Log response to ensure the backend is returning correct data
            console.log(response.data); 
    
            // Store tokens in local storage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
    
            // Decode the token to get the role
            const decodedToken = jwtDecode(response.data.access);
            console.log("Decoded Token:", decodedToken);
    
            // Get the role from the decoded token
            const role = decodedToken.role;  // Should be 'admin' or 'doctor'
            console.log("Role in token:", role);
    
            // Navigate based on role
            if (role === 'admin') {
                navigate('/admin/dashboard');  // Redirect to admin dashboard
            } else if (role === 'doctor') {
                navigate('/doctor/dashboard');  // Redirect to doctor dashboard
            } else {
                alert('Unknown role');  // Handle unknown role case
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
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
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
            <Link to="/">
                    <button>Go to Home</button>
                </Link>
        </form>
    );
};

export default Login;