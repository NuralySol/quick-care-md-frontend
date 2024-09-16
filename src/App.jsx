import { Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';  // Signup component
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    return (
        <Routes>
            {/* Show the Signup form on the landing page */}
            <Route path="/" element={<Signup />} />

            {/* Login page */}
            <Route path="/login" element={<Login />} />

            {/* Admin dashboard: only accessible to 'admin' role */}
            <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </PrivateRoute>
            } />

            {/* Doctor dashboard: only accessible to 'doctor' role */}
            <Route path="/doctor/dashboard" element={
                <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                </PrivateRoute>
            } />
        </Routes>
    );
};

export default App;