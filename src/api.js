import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', 
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    console.log("Access token:", token);  // Log the token to check if it exists
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create Admin
export const createAdmin = async (credentials) => {
    return await api.post('/users/register/', {
        ...credentials,
        role: 'admin',
        is_staff: true // Admins are staff users
    });
};

// Delete User
export const deleteUser = (userId) => {
    if (!userId) {
        console.error("User ID is undefined. Cannot send DELETE request.");
        return;
    }
    
    return api.delete(`/users/${userId}/`, {  // Using the `api` instance for DELETE
        headers: getAuthHeaders()
    });
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("Token expired. Trying to refresh...");  // Log when refreshing token
            const tokenRefreshed = await refreshToken(); 

            if (tokenRefreshed) {
                console.log("Token refreshed. Retrying the original request.");
                originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
                return api(originalRequest); 
            } else {
                console.error("Token refresh failed. Redirecting to login.");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Login request - retrieves the access and refresh tokens
export const login = async (credentials) => {
    return await api.post('/token/', credentials);
};

// Refresh token request
export const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
        const response = await api.post('/token/refresh/', { refresh: refresh_token });
        localStorage.setItem('access_token', response.data.access);
        return true;
    }
    return false;
};

// Users API
export const getUsers = () => api.get('/users/', { headers: getAuthHeaders() });

// Doctors API
export const getDoctors = () => api.get('/doctors/', { headers: getAuthHeaders() });
export const getDoctor = (id) => api.get(`/doctors/${id}/`, { headers: getAuthHeaders() });
export const createDoctor = async (data) => {
    console.log("Doctor data being sent to API:", data);  // Add log here
    return api.post('/doctors/', data, { headers: getAuthHeaders() });
};
export const updateDoctor = (id, data) => api.put(`/doctors/${id}/`, data, { headers: getAuthHeaders() });
export const deleteDoctor = (id) => api.delete(`/doctors/${id}/`, { headers: getAuthHeaders() });

// Patients API
export const getPatients = () => api.get('/patients/', { headers: getAuthHeaders() });
export const getPatient = (id) => api.get(`/patients/${id}/`, { headers: getAuthHeaders() });

// Diseases API
export const getDiseases = () => api.get('/diseases/', { headers: getAuthHeaders() });