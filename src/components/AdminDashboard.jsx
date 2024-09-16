import { useState, useEffect } from 'react';
import { deleteUser, getUsers } from '../api.js';  // Import getUsers and deleteUser

const AdminDashboard = () => {  // Make sure this is declared as a component
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const fetchUsers = async () => {
        try {
            const response = await getUsers();  // Use getUsers to fetch users
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);  // Use deleteUser to deactivate user
            alert('User deactivated successfully.');
            fetchUsers();  // Re-fetch users after deletion
        } catch (error) {
            console.error('Failed to deactivate user:', error);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleDelete(user.id)}>Deactivate User</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;  // Ensure this is a default export