import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        if (allowedRoles.includes(userRole)) {
            return children;
        } else {
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        return <Navigate to="/login" replace />;
    }
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default PrivateRoute;