import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role');

    if (!token || (allowedRoles && !allowedRoles.includes(userRole))) {
        return <Navigate to="/" />;
    }

    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;