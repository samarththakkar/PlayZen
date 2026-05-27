/**
 * Ensures that a URL uses the secure https protocol.
 * If the URL starts with http://, it is replaced with https://.
 * 
 * @param {string} url - The URL to secure
 * @returns {string} - The secured HTTPS URL
 */
export const ensureHttps = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://')) {
        return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
};
