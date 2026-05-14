/**
 * Returns the cookie options for setting auth cookies.
 * Handles cross-origin deployment (e.g. Vercel frontend + Render backend).
 */
export const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        // maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days (uncomment if needed)
    };
};
