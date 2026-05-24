import axios from 'axios';
import toast from '../utils/toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const suppressToast = error.config?._suppressToast;

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