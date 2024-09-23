import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser as deleteUserApi, getUsers, createDoctor, getDischargedPatients, deletePatient } from '../api';

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

    // Handle deleting a patient by their name
    const handleDeletePatient = async (patientName) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            try {
                await deletePatient(patientName);  // Call the API to delete the patient by name
                alert('Patient deleted successfully.');
                fetchDischargedPatients();  // Refresh the list of discharged patients
            } catch (error) {
                setError('Failed to delete patient.');
                console.error('Failed to delete patient:', error);
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
            window.location.reload();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading ? (
                <p>Loading users...</p>
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

            <h3 style={{ marginTop: '30px' }}>Create a New Doctor</h3>
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

            {showModal && (
                <div style={{
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center'
                    }}>
                        <h3>You cannot deactivate yourself while there are doctors present!</h3>
                        <button onClick={handleCloseModal} style={{
                            marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px'
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            <h3 style={{ marginTop: '30px' }}>Discharged Patients</h3>
            {dischargedPatients.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Patient Name</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Discharge Date</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Doctor</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dischargedPatients.map((patient) => (
                            <tr key={patient.discharge_id}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{patient.patient_name}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(patient.discharge_date).toLocaleDateString()}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{patient.doctor_name}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    <button
                                        onClick={() => handleDeletePatient(patient.discharge_id)}
                                        style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Delete Patient
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No discharged patients available.</p>
            )}

            <div style={{ marginTop: '20px' }}>
                <Link to="/">
                    <button style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#3498db', color: 'white', border: 'none' }}>Go to Home</button>
                </Link>
                <Link to="/login" style={{ marginLeft: '10px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#34495e', color: 'white', border: 'none' }}>Go to Login</button>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;