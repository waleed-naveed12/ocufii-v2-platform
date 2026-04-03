import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";

/**
 * Login API
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} roleId - User role ID (default: "3")
 * @returns {Promise} - Login response with user data and tokens
 */
export const loginAPI = async (email, password, roleId = "3") => {
  try {
    const response = await api.post(APIROUTES.LOGIN, {
      email,
      password,
      roleId,
    });
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

/**
 * Forgot Password API — sends a verification link to the user's email
 * @param {string} email
 */
export const forgotPasswordAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.FORGOT_PASSWORD_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    throw error;
  }
};

export const changePasswordEmailAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.CHANGE_PASSWORD_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Change Password Email API Error:", error);
    throw error;
  }
};

export const changePasswordDirectAPI = async ({
  email,
  oldPassword,
  newPassword,
}) => {
  try {
    const response = await api.post(APIROUTES.CHANGE_PASSWORD_DIRECT, {
      email,
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Change Password Direct API Error:", error);
    throw error;
  }
};

export const resetPasswordAPI = async ({ email, newPassword }) => {
  try {
    const response = await api.post(APIROUTES.RESET_PASSWORD, {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset Password API Error:", error);
    throw error;
  }
};

/**
 * Logout API (if needed in future)
 */
export const logoutAPI = async () => {
  // Implement logout API call if backend supports it
  return Promise.resolve();
};
