import axios from 'axios';

const api = axios.create({
    baseURL: 'https://quick-care-md-46e277bedd2b.herokuapp.com/',  // Make sure this is your correct backend URL
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interceptor for handling token expiration and refreshing
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const tokenRefreshed = await refreshToken();

            if (tokenRefreshed) {
                originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
                return api(originalRequest);  // Retry the original request
            } else {
                // Handle logout if refresh fails
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';  // Redirect to login page
            }
        }
        return Promise.reject(error);
    }
);

// Login request - retrieves access and refresh tokens
export const login = async (credentials) => {
    return await api.post('/token/', credentials);
};

// Refresh token request
export const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
        try {
            const response = await api.post('/token/refresh/', { refresh: refresh_token });
            localStorage.setItem('access_token', response.data.access);
            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }
    return false;
};

// User-related APIs
export const getUsers = () => api.get('/users/', { headers: getAuthHeaders() });
export const createAdmin = async (credentials) => {
    return api.post('/users/register/', {
        ...credentials,
        role: 'admin',
        is_staff: true
    });
};
export const deleteUser = (userId) => api.delete(`/users/${userId}/`, { headers: getAuthHeaders() });

// Doctor-related APIs
export const getDoctors = () => api.get('/doctors/', { headers: getAuthHeaders() });
export const getDoctor = (id) => api.get(`/doctors/${id}/`, { headers: getAuthHeaders() });
export const createDoctor = async (data) => api.post('/doctors/', data, { headers: getAuthHeaders() });
export const updateDoctor = (id, data) => api.put(`/doctors/${id}/`, data, { headers: getAuthHeaders() });
export const deleteDoctor = (id) => api.delete(`/doctors/${id}/`, { headers: getAuthHeaders() });
export const fireDoctor = (id) => api.post(`/doctors/${id}/fire/`, {}, { headers: getAuthHeaders() });

// Patient-related APIs
export const getPatients = () => api.get('/patients/', { headers: getAuthHeaders() });
export const getPatient = (id) => api.get(`/patients/${id}/`, { headers: getAuthHeaders() });
export const createPatient = async (patientData) => api.post('/patients/', patientData, { headers: getAuthHeaders() });
export const deletePatient = (id) => api.delete(`/patients/${id}/`, { headers: getAuthHeaders() });

// Discharge-related APIs
export const getDischargedPatients = async () => api.get('/discharges/', { headers: getAuthHeaders() });
export const dischargePatient = async (patientId) => api.post(`/patients/${patientId}/discharge/`, {}, { headers: getAuthHeaders() });
// Add this to your api.js or equivalent file
export const purgeAllDischargedPatients = async () => {
    return api.delete(`/patients/discharged/purge/`, { headers: getAuthHeaders() });
};


// Disease-related APIs
export const getDiseases = () => api.get('/diseases/', { headers: getAuthHeaders() });

// Treatment-related APIs
export const assignTreatment = async (treatmentData) => api.post('/treatments/', treatmentData, { headers: getAuthHeaders() });
export const getTreatmentOptions = () => api.get('/treatments/options/', { headers: getAuthHeaders() });