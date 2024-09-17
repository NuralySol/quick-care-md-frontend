import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');  // Assuming you store the role in localStorage after login

    // Check if the token exists and if the user has one of the allowed roles
    if (!token || !allowedRoles.includes(userRole)) {
        // Redirect to the login page if not authenticated or authorized
        return <Navigate to="/login" />;
    }

    // If authenticated and authorized, render the children (the protected route)
    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.array.isRequired,
};

export default PrivateRoute;