import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createAdmin } from '../api';
import { CircularProgress, Button, TextField, Typography, Box, Alert, Link } from '@mui/material';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', severity: '' });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAdmin({ username, password });  // Create an admin request
            setMessage({ text: 'Admin account created successfully. Please log in.', severity: 'success' });
            setTimeout(() => navigate('/login'), 1000); // Redirect after showing message
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Signup failed. Please try again.';
            setMessage({ text: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSignup} sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Create Admin Account
            </Typography>
            {message.text && (
                <Alert severity={message.severity} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                margin="normal"
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                margin="normal"
            />
            <Box sx={{ position: 'relative', mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Creating Admin...' : 'Create Admin'}
                </Button>
                {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>

            {/* Add link to login page */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login">
                        Login here
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Signup;