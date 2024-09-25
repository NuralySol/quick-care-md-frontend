import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createAdmin } from '../api';
import { CircularProgress, Button, TextField, Typography, Box, Alert, Link } from '@mui/material';
import styles from './Signup.module.css'; 

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
            await createAdmin({ username, password });
            setMessage({ text: 'Admin account created successfully. Please log in.', severity: 'success' });
            setTimeout(() => navigate('/login'), 1000);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Signup failed. Please try again.';
            setMessage({ text: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signupContainer}>
            <Box component="form" onSubmit={handleSignup} className={styles.signupForm}>
                <Typography variant="h5" gutterBottom className={styles.h2}>
                    Create Admin Account
                </Typography>
                {message.text && (
                    <Alert severity={message.severity} className={styles.alertMessage}>
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
                <Box className={styles.signupButtonContainer}>
                    <Button type="submit" variant="contained" className={styles.signupButton} disabled={loading}>
                        {loading ? 'Creating Admin...' : 'Create Admin'}
                    </Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }}
                        />
                    )}
                </Box>

                {/* Add link to login page */}
                <Box className={styles.signupLinkContainer}>
                    <Typography variant="body2">
                        Already have an account Doctor or Admin?{' '}
                        <Link component={RouterLink} to="/login">
                            Login here
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </div>
    );
};

export default Signup;