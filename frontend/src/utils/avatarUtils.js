/**
 * Generates a consistent, deterministic avatar background color based on a string.
 * This ensures the same user always gets the exact same "random" avatar.
 *
 * @param {string} str - The string to hash (e.g. username or ID)
 * @returns {string} - A 6-character hex color code (without the #)
 */
const stringToColor = (str) => {
    if (!str) return '6366f1'; // Default Indigo

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

/**
 * Gets a consistent avatar URL for a given user object.
 * The backend now permanently saves either a Cloudinary URL or a generated 
 * ui-avatars.com URL upon registration. This utility ensures we safely fetch it,
 * with a tiny safety net.
 *
 * @param {Object} owner - The user object (can be populated DB document or partial payload)
 * @param {string} fallbackName - Name to use in the avatar text if owner data is missing
 * @returns {string} - The URL of the avatar image
 */
export const getAvatarUrl = (owner, fallbackName = "Unknown") => {
    if (!owner) {
        const bgColor = stringToColor(fallbackName);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=${bgColor}&color=fff&length=1`;
    }

    // Use the permanently saved avatar from the database
    const rawAvatarUrl = owner.avatar;
    if (rawAvatarUrl && rawAvatarUrl.trim().length > 0) {
        return rawAvatarUrl;
    }

    // Extreme fallback if DB was somehow corrupted
    const name = owner.fullname || owner.username || fallbackName;
    const bgColor = stringToColor(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&length=1`;
};
