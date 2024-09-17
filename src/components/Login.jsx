import React, { useState } from 'react';
import { login } from '../api.js';  // Assuming your API functions are in api.js
import { useNavigate, Link } from 'react-router-dom';  // Import Link from react-router-dom
import "./Login.css";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();  // To navigate after login

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(credentials);  // Call login API with credentials
            const token = response.data.access;  // Assuming the response contains an access token
            localStorage.setItem('token', token);  // Store token in localStorage
            alert('Login successful');
            navigate('/admin/dashboard');  // Redirect to admin dashboard
        } catch (error) {
            setErrorMessage('Invalid username or password');  // Display error message
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    return (
        <div>
            <div className="title">QUICK CARE MD</div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}  {/* Display error */}
                <button type="submit">Login</button>
            </form>
            <div>
                <Link to="/">Back to Create User</Link>  {/* Add link to navigate back to home */}
            </div>
        </div>
    );
};

export default LoginPage;
