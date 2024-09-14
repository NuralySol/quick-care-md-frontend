import { Routes, Route } from 'react-router-dom'; // No BrowserRouter here
import Login from './components/Login';
import DoctorDashboard from './components/DoctorDashboard';
import DiseaseList from './components/DiseaseList';
import PatientList from './components/PatientList';
import LogoutButton from './components/LogoutButton';
import PrivateRoute from './components/PrivateRoute';  // Import PrivateRoute

const App = () => {
  return (
    <div>
      <LogoutButton />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/diseases"
          element={
            <PrivateRoute>
              <DiseaseList />
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <PatientList />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;