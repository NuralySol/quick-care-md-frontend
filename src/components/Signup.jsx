import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdmin } from '../api';  


//! Double check the code below and make sure that it routes to either admin or doctor dashboard

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await createAdmin({ username, password });  // Create an admin request

            // After successful admin creation, navigate to the login page
            alert('Admin account created successfully. Please log in.');
            navigate('/');  // Redirect to the login page
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Signup failed. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <h2>Create Admin Account</h2>
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
                autoComplete="new-password"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Creating Admin...' : 'Create Admin'}
            </button>
        </form>
    );
};

export default Signup;