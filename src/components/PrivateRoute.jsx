import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, allowedRoles }) => {
    // Get the access token from localStorage
    const token = localStorage.getItem('access_token');

    // If there's no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Decode the token to get the user's role
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;  // Assumes the role is stored in the 'role' field

        // Check if the user's role is allowed to access this route
        if (allowedRoles.includes(userRole)) {
            return children;
        } else {
            // Redirect to the login page or an unauthorized page if the role is not allowed
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        // In case of any errors (e.g., token is invalid or expired), redirect to login
        return <Navigate to="/login" replace />;
    }
};

export default PrivateRoute;