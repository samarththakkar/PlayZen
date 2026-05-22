import api from "./api.js";

export const getSettings = async () => {
    return api.get("/settings");
};

export const updateNotificationSettings = async (emailNotifications, pushNotifications) => {
    return api.patch("/settings/notifications", { emailNotifications, pushNotifications });
};

export const updatePrivacySettings = async (profileVisibility, searchVisibility) => {
    return api.patch("/settings/privacy", { profileVisibility, searchVisibility });
};

export const updatePlaybackSettings = async (hoverAutoplay) => {
    return api.patch("/settings/playback", { hoverAutoplay });
};

export const updatePersonalInfo = async (formData) => {
    return api.patch("/settings/personal-info", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const changePassword = async (currentPassword, newPassword) => {
    return api.post("/settings/change-password", { currentPassword, newPassword });
};

export const changeEmail = async (newEmail, password) => {
    return api.post("/settings/change-email", { newEmail, password });
};

export const verifyNewEmail = async (otp) => {
    return api.post("/settings/verify-email", { otp });
};
