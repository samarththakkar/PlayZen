import axios from 'axios';
import toast from '../utils/toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to attach Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('playzen_accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// URL patterns that are always "silent" — never show any toast for these
const SILENT_URL_PATTERNS = [
    '/watch-progress',
    '/watch-history',
    '/watch-later/toggle',
    '/recommendations/not-interested',
    '/recommendations/block-channel',
    '/recommendations/report',
    '/notifications/unread-count',   // polled silently on mount
    '/notifications',                // background load in header
    '/users/current-user',           // auth session check
    '/users/login',
    '/users/register',
    '/users/logout',
    '/users/forgot-password',
    '/users/reset-password',
    '/users/send-otp',
    '/users/verify-otp',
    '/comments',
];

// URL patterns where success toasts are suppressed (errors will still toast)
const SILENT_SUCCESS_URL_PATTERNS = [
    '/settings',
    '/likes',
    '/subscriptions',
];

const isSilentUrl = (url = '') =>
    SILENT_URL_PATTERNS.some(pattern => url.includes(pattern));

const isSilentSuccessUrl = (url = '') =>
    SILENT_SUCCESS_URL_PATTERNS.some(pattern => url.includes(pattern));

api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase();
        const url = response.config.url || '';
        const suppressToast = response.config._suppressToast;

        // Show success toast for user-initiated mutating actions only
        if (
            !suppressToast &&
            method &&
            ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) &&
            !isSilentUrl(url) &&
            !isSilentSuccessUrl(url)
        ) {
            const message = response.data?.message || response.data?.data?.message || 'Action completed successfully!';
            toast.success(message);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest?.url || '';
        const suppressToast = originalRequest?._suppressToast;

        // Handle 401 and attempt token refresh if we have a refresh token
        if (status === 401 && originalRequest && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('playzen_refreshToken');
            if (refreshToken) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                    .then((token) => {
                        originalRequest._retry = true;
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                return new Promise((resolve, reject) => {
                    axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`, { refreshToken })
                        .then((res) => {
                            const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
                            const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

                            if (newAccessToken) {
                                localStorage.setItem('playzen_accessToken', newAccessToken);
                                if (newRefreshToken) {
                                    localStorage.setItem('playzen_refreshToken', newRefreshToken);
                                }
                                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                                processQueue(null, newAccessToken);
                                resolve(api(originalRequest));
                            } else {
                                throw new Error('Invalid refresh response');
                            }
                        })
                        .catch((err) => {
                            processQueue(err);
                            // Clear session details on failed refresh
                            localStorage.removeItem('playzen_user');
                            localStorage.removeItem('playzen_accessToken');
                            localStorage.removeItem('playzen_refreshToken');
                            window.dispatchEvent(new Event('storage')); // trigger sync across tabs
                            window.dispatchEvent(new Event('playzen-logout')); // trigger state update in current tab
                            reject(err);
                        })
                        .finally(() => {
                            isRefreshing = false;
                        });
                });
            }
        }

        // Always silent: background URLs, suppressed callers, or 401s from auth/notification checks
        if (suppressToast || isSilentUrl(url)) {
            return Promise.reject(error);
        }

        // Also silent: 401 on any notification or auth endpoint
        if (status === 401) {
            return Promise.reject(error);
        }

        let message = error.response?.data?.message;
        if (!message) {
            if (error.message === 'Network Error') {
                // Don't show network error for background/polling requests
                message = 'Could not connect to the server. Please check your internet connection.';
            } else if (error.code === 'ECONNABORTED') {
                message = 'The request timed out. Please try again.';
            } else if (status === 500) {
                message = 'An unexpected server error occurred. Please try again later.';
            } else if (status === 403) {
                message = 'You do not have permission to perform this action.';
            } else if (status === 404) {
                message = 'The requested resource could not be found.';
            } else {
                message = 'An error occurred. Please try again.';
            }
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;