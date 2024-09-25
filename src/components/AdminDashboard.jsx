import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser as deleteUserApi, getUsers, createDoctor, getDischargedPatients, purgeAllDischargedPatients } from '../api';
import './Admin.css'

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);
    const [doctorUsername, setDoctorUsername] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorPassword, setDoctorPassword] = useState('');
    const [creatingDoctor, setCreatingDoctor] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dischargedPatients, setDischargedPatients] = useState([]);
    const [activeSection, setActiveSection] = useState('doctors'); // Defaults to Doctors

    useEffect(() => {
        fetchUsers();
        fetchDischargedPatients();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getUsers();
            const username = localStorage.getItem('username');
            const filteredUsers = response.data.filter(user => user.role && !user.is_superuser);
            const loggedInUser = response.data.find(user => user.username === username);
            setUsers(filteredUsers);
            setCurrentUser(loggedInUser);
        } catch (error) {
            setError('Failed to fetch users.');
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDischargedPatients = async () => {
        setError('');
        try {
            const response = await getDischargedPatients();
            setDischargedPatients(response.data);
        } catch (error) {
            setError('Failed to fetch discharged patients.');
            console.error('Failed to fetch discharged patients:', error);
        }
    };

    const handlePurgeAllDischargedPatients = async () => {
        if (window.confirm('Are you sure you want to delete all discharged patients? This action cannot be undone.')) {
            try {
                await purgeAllDischargedPatients();
                alert('All discharged patients deleted successfully.');
                fetchDischargedPatients();
            } catch (error) {
                setError('Failed to delete all discharged patients.');
                console.error('Failed to delete all discharged patients:', error);
            }
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (currentUser && userId === currentUser.id && users.some(user => user.role === 'doctor')) {
            setShowModal(true);
            return;
        }

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

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Handle crete doctor

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

            setDoctorUsername('');
            setDoctorName('');
            setDoctorPassword('');

            setTimeout(() => {
                window.location.reload();
            }, 200);
        } catch (error) {
            console.error('Failed to create doctor:', error);
            setTimeout(() => {
                window.location.reload();
            }, 200);
        } finally {
            setCreatingDoctor(false);
        }
    };

    return (
        <>
            <div className="sidebar">
                <ul>
                    <li><Link to="/">Home</Link></li> {/* Link to home */}
                    <li><button onClick={() => setActiveSection('doctors')}>Doctors</button></li>
                    <li><button onClick={() => setActiveSection('patients')}>Patients</button></li>
                    <li><Link to="/login">Login</Link></li>
                </ul>
            </div>

            <div className='admin-container'>
                <div style={{ padding: '20px' }}>
                    {/* Hospital name */}
                    <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>QuickCare Md</h1>

                    <h2>Admin Dashboard</h2>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {activeSection === 'doctors' && (
                        <>
                            <h3>Create a New Doctor</h3>
                            <form onSubmit={handleCreateDoctor}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                                    <input
                                        type="text"
                                        value={doctorUsername}
                                        onChange={(e) => setDoctorUsername(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                                    <input
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                                    <input
                                        type="password"
                                        value={doctorPassword}
                                        onChange={(e) => setDoctorPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={creatingDoctor}
                                    style={{
                                        backgroundColor: creatingDoctor ? '#ccc' : '#27ae60',
                                        color: 'white',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: creatingDoctor ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {creatingDoctor ? 'Creating Doctor...' : 'Create Doctor'}
                                </button>
                            </form>

                            <h3>Doctors List</h3>
                            {loading ? (
                                <p>Loading doctors...</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ border: '1px solid black', padding: '8px' }}>Username</th>
                                            <th style={{ border: '1px solid black', padding: '8px' }}>Role</th>
                                            <th style={{ border: '1px solid black', padding: '8px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td style={{ border: '1px solid black', padding: '8px' }}>{user.username}</td>
                                                <td style={{ border: '1px solid black', padding: '8px' }}>{user.role}</td>
                                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                                    <button
                                                        onClick={() => handleDeactivateUser(user.id)}
                                                        disabled={deactivatingUserId === user.id}
                                                        style={{
                                                            backgroundColor: deactivatingUserId === user.id ? '#ccc' : '#e74c3c',
                                                            color: 'white',
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {deactivatingUserId === user.id ? 'Deactivating...' : 'Deactivate User'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeSection === 'patients' && (
                        <>
                            <h3>Discharged Patients</h3>
                            {dischargedPatients.length > 0 ? (
                                <div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '1px solid black', padding: '8px' }}>Patient Name</th>
                                                <th style={{ border: '1px solid black', padding: '8px' }}>Discharge Date</th>
                                                <th style={{ border: '1px solid black', padding: '8px' }}>Doctor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dischargedPatients.map((patient) => (
                                                <tr key={patient.discharge_id}>
                                                    <td style={{ border: '1px solid black', padding: '8px' }}>{patient.patient_name}</td>
                                                    <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(patient.discharge_date).toLocaleDateString()}</td>
                                                    <td style={{ border: '1px solid black', padding: '8px' }}>{patient.doctor_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={handlePurgeAllDischargedPatients}
                                        style={{
                                            marginTop: '20px',
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Purge All Discharged Patients
                                    </button>
                                </div>
                            ) : (
                                <p>No discharged patients available.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
