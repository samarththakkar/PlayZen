import api from './api';

const authService = {
    login: async (credentials) => {
        return await api.post('/users/login', credentials);
    },

    register: async (userData) => {
        return await api.post('/users/register', userData);
    },

    logout: async () => {
        return await api.post('/users/logout');
    },

    getCurrentUser: async () => {
        return await api.get('/users/current-user');
    }
};

export default authService;
