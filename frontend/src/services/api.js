import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase();
        // If it's a mutating action, show success toast (unless it's a background request)
        if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const url = response.config.url || "";
            const isBackground = 
                url.includes('/watch-progress') || 
                url.includes('/watch-history') ||
                url.includes('/watch-later/toggle') ||
                url.includes('/recommendations/not-interested') ||
                url.includes('/recommendations/block-channel') ||
                url.includes('/recommendations/report');

            if (!isBackground) {
                const message = response.data?.message || response.data?.data?.message || 'Action completed successfully!';
                toast.success(message);
            }
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const isCurrentSessionCheck = error.config?.url?.includes('/users/current-user');

        // Do not display toaster for guest user checks that return 401
        if (!(status === 401 && isCurrentSessionCheck)) {
            let message = error.response?.data?.message;
            if (!message) {
                if (error.message === "Network Error") {
                    message = "Could not connect to the server. Please check your internet connection.";
                } else if (error.code === "ECONNABORTED") {
                    message = "The request timed out. Please try again.";
                } else if (status === 500) {
                    message = "An unexpected server error occurred. Please try again later.";
                } else if (status === 403) {
                    message = "You do not have permission to perform this action.";
                } else if (status === 404) {
                    message = "The requested resource could not be found.";
                } else {
                    message = "An error occurred. Please try again.";
                }
            }
            toast.error(message);
        }
        
        return Promise.reject(error);
    }
);

export default api;