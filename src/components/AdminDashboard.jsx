import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  
import { deleteUser as deleteUserApi, getUsers, createDoctor } from '../api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);
    const [doctorUsername, setDoctorUsername] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorPassword, setDoctorPassword] = useState('');
    const [creatingDoctor, setCreatingDoctor] = useState(false);
    const [view, setView] = useState('home');

    useEffect(() => {
        fetchUsers();
    }, []);

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
                    role: 'doctor',
                },
            };
    
            await createDoctor(doctorData);
    
            alert('Doctor created successfully.');
            fetchUsers();  
            setDoctorUsername('');
            setDoctorName('');
            setDoctorPassword('');
          
        } catch (error) {
            let errorMessage = 'Failed to create doctor.';
            if (error.response && error.response.data) {
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
            window.location.reload()
        }
    };

    return (
        <div>
            {/* Sidebar */}
            <div style={{
                width: '300px',
                backgroundColor: '#FFC0CB',
                padding: '20px',
                position: 'fixed',
                top: '0',
                left: '0',
                height: '100vh', 
                boxSizing: 'border-box',
            }}>
                <h2>Admin Panel</h2>
                <ul style={{ listStyle: 'none', padding: '0', }}>
                    <li>
                        <button style={{ width: '100%', padding: '10px', marginTop: '10px' }} onClick={() => setView('doctors')}>
                            Doctors Panel
                        </button>
                    </li>
                    <li style={{ marginTop: '20px' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'black' }}>
                            <button style={{ width: '100%', padding: '10px' }}>Login</button>
                        </Link>
                    </li>
                    <li style={{ marginTop: '10px' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
                            <button style={{ width: '100%', padding: '10px' }}>Back Home</button>
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: '320px', padding: '20px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '50px', fontWeight: 'bold', color: '#008000' }}>Doctors Panel</h1>

                {loading ? (
                    <p style={{ textAlign: 'center' }}>Loading doctors...</p>
                ) : (
                    <table style={{ width: '50%', margin: '0 auto', textAlign: 'center', borderCollapse: 'collapse', fontSize: '20..px' }}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users
                                .filter(user => user.role === 'doctor')
                                .map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeactivateUser(user.id)}
                                            disabled={deactivatingUserId === user.id}
                                        >
                                            {deactivatingUserId === user.id ? 'Deactivating...' : 'Deactivate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <h3 style={{ textAlign: 'center', marginTop: '30px' }}>Create a New Doctor</h3>
                <form onSubmit={handleCreateDoctor} style={{ width: '50%', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={doctorUsername}
                            onChange={(e) => setDoctorUsername(e.target.value)}
                            required
                            style={{ marginLeft: '10px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            required
                            style={{ marginLeft: '10px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={doctorPassword}
                            onChange={(e) => setDoctorPassword(e.target.value)}
                            required
                            style={{ marginLeft: '10px' }}
                        />
                    </div>
                    <button type="submit" disabled={creatingDoctor}>
                        {creatingDoctor ? 'Creating Doctor...' : 'Create Doctor'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;