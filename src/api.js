import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', 
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            await refreshToken(); 
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            return api(originalRequest); 
        }
        return Promise.reject(error);
    }
);

// Login request - retrieves the access and refresh tokens
export const login = (credentials) => {
    return api.post('/token/', credentials);
};

// Refresh token request
export const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
        const response = await api.post('/token/refresh/', { refresh: refresh_token });
        localStorage.setItem('access_token', response.data.access);
    }
};

// Doctors API - List and create doctors
export const getDoctors = () => api.get('/doctors/', { headers: getAuthHeaders() });
export const getDoctor = (id) => api.get(`/doctors/${id}/`, { headers: getAuthHeaders() });
export const createDoctor = (data) => api.post('/doctors/', data, { headers: getAuthHeaders() });
export const updateDoctor = (id, data) => api.put(`/doctors/${id}/`, data, { headers: getAuthHeaders() });
export const deleteDoctor = (id) => api.delete(`/doctors/${id}/`, { headers: getAuthHeaders() });

// Patients API - List and create patients
export const getPatients = () => api.get('/patients/', { headers: getAuthHeaders() });
export const getPatient = (id) => api.get(`/patients/${id}/`, { headers: getAuthHeaders() });

// Diseases API - List diseases
export const getDiseases = () => api.get('/diseases/', { headers: getAuthHeaders() });