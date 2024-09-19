import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Import Link
import { deleteUser as deleteUserApi, getUsers, createDoctor } from '../api';

const AdminDashboard = () => {
    // State variables
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);
    const [doctorUsername, setDoctorUsername] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorPassword, setDoctorPassword] = useState('');
    const [creatingDoctor, setCreatingDoctor] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to fetch users from the backend
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            setError('Failed to fetch users.');
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle user deactivation
    const handleDeactivateUser = async (userId) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            setDeactivatingUserId(userId);
            setError('');
            try {
                await deleteUserApi(userId);
                alert('User deactivated successfully.');
                fetchUsers();
            } catch (error) {
                setError('Failed to deactivate user.');
                console.error('Failed to deactivate user:', error);
            } finally {
                setDeactivatingUserId(null);
            }
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setCreatingDoctor(true);
        setError('');
        
        try {
            const doctorData = {
                name: doctorName,
                user: {
                    username: doctorUsername,
                    password: doctorPassword,
                    role: 'doctor', // Hardcoded role
                },
            };
    
            console.log("Sending doctor data to backend:", doctorData);
    
            await createDoctor(doctorData);
    
            alert('Doctor created successfully.');
            fetchUsers();  // Refresh users
            setDoctorUsername('');
            setDoctorName('');
            setDoctorPassword('');
        } catch (error) {
            let errorMessage = 'Failed to create doctor.';
            if (error.response && error.response.data) {
                console.error('Backend error response:', error.response.data);
                const extractErrorMessages = (errorData) => {
                    let messages = [];
                    for (const [field, value] of Object.entries(errorData)) {
                        if (Array.isArray(value)) {
                            messages.push(`${field}: ${value.join(', ')}`);
                        } else if (typeof value === 'object' && value !== null) {
                            const nestedMessages = extractErrorMessages(value);
                            messages.push(`${field}: ${nestedMessages}`);
                        } else {
                            messages.push(`${field}: ${value}`);
                        }
                    }
                    return messages.join(' | ');
                };
                errorMessage = extractErrorMessages(error.response.data);
            }
            setError(errorMessage);
            console.error('Failed to create doctor:', error);
        } finally {
            setCreatingDoctor(false);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>

            {/* Display an error message if something goes wrong */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Show loading message while fetching users */}
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeactivateUser(user.id)}
                                        disabled={deactivatingUserId === user.id}
                                    >
                                        {deactivatingUserId === user.id ? 'Deactivating...' : 'Deactivate User'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Form to create a new doctor */}
            <h3>Create a New Doctor</h3>
            <form onSubmit={handleCreateDoctor}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={doctorUsername}
                        onChange={(e) => setDoctorUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={creatingDoctor}>
                    {creatingDoctor ? 'Creating Doctor...' : 'Create Doctor'}
                </button>
            </form>

            {/* Navigation buttons */}
            <div style={{ marginTop: '20px' }}>
                <Link to="/">
                    <button>Go to Home</button>
                </Link>
                <Link to="/login" style={{ marginLeft: '10px' }}>
                    <button>Go to Login</button>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
